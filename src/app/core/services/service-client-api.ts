import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { sha256Hex } from '../utils/crypto';
import { buildFingerprint } from '../utils/fingerprint';
import { resolveApiBase, resolveGatewayBase } from '../utils/gateway-url';
import { ServicePow } from './service-pow';

@Injectable({ providedIn: 'root' })
export class ServiceClientApi {
  private token: string | null = null;
  private clientFp: string | null = null;
  private gatewayFp: string | null = null;
  private readonly pow = inject(ServicePow);

  setToken(t: string | null): void {
    this.token = t;
  }

  getToken(): string | null {
    return this.token;
  }

  private async getHeaders(method: string, url: string): Promise<Record<string, string>> {
    if (!this.clientFp) this.clientFp = await buildFingerprint();
    if (!this.gatewayFp) this.gatewayFp = await sha256Hex(`fp:${this.clientFp}`);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Request-Id': `req_${Date.now()}_${Math.floor(Math.random() * 1e6)}`,
      'X-Client-Fingerprint': this.clientFp
    };
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;
    const apiBase = resolveApiBase();
    const gwBase = resolveGatewayBase();
    if (url.startsWith(apiBase) || url.startsWith(gwBase)) {
      const fullUrl = url.startsWith('http') ? url : `${gwBase}${url}`;
      const proof = await this.pow.generateProof(method, fullUrl, this.gatewayFp);
      if (proof) {
        headers['X-PoW-Proof'] = proof.proof;
        headers['X-PoW-Nonce'] = proof.nonce;
        headers['X-PoW-Timestamp'] = String(proof.timestamp);
      }
    }
    return headers;
  }

  async request<T>(method: string, path: string, body?: unknown): Promise<{ status: number; data: T }> {
    const url = path.startsWith('http') ? path : `${resolveApiBase()}${path.startsWith('/') ? '' : '/'}${path}`;
    const headers = await this.getHeaders(method, url);
    const res = await fetch(url, {
      method,
      headers,
      body: body && method !== 'GET' ? JSON.stringify(body) : undefined
    });
    let data: T;
    try {
      data = (await res.json()) as T;
    } catch {
      data = { status: res.status } as T;
    }
    return { status: res.status, data };
  }

  async get<T>(path: string): Promise<{ status: number; data: T }> {
    return this.request<T>('GET', path);
  }

  async post<T>(path: string, body: unknown): Promise<{ status: number; data: T }> {
    return this.request<T>('POST', path, body);
  }

  async put<T>(path: string, body: unknown): Promise<{ status: number; data: T }> {
    return this.request<T>('PUT', path, body);
  }

  /**
   * PoW still applied; Authorization omitted (e.g. POST /bot/auth per API contract).
   */
  async postWithoutAuth<T>(path: string, body: unknown): Promise<{ status: number; data: T }> {
    const saved = this.token;
    this.token = null;
    try {
      return await this.post<T>(path, body);
    } finally {
      this.token = saved;
    }
  }

  /** PoW only, no Bearer (rare public GET under /api/v1). */
  async getWithoutAuth<T>(path: string): Promise<{ status: number; data: T }> {
    const saved = this.token;
    this.token = null;
    try {
      return await this.get<T>(path);
    } finally {
      this.token = saved;
    }
  }
}
