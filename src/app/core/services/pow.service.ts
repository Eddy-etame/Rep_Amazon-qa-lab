import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { sha256Hex } from '../utils/crypto';

export interface PowResult {
  proof: string;
  nonce: string;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class PowService {
  private normalizePath(url: string): string {
    try {
      const parsed = new URL(url, window.location.origin);
      return `${parsed.pathname}${parsed.search}`;
    } catch {
      return url.startsWith('/') ? url : `/${url}`;
    }
  }

  private randomNonceSeed(): string {
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  async generateProof(method: string, url: string, fingerprintHash: string): Promise<PowResult | null> {
    const difficulty = environment.powDifficulty ?? 0;
    if (difficulty <= 0) return null;
    const timestamp = Date.now();
    const path = this.normalizePath(url);
    const targetPrefix = '0'.repeat(difficulty);
    const seed = this.randomNonceSeed();
    for (let attempt = 0; attempt < 250_000; attempt++) {
      const nonce = `${seed}-${attempt}`;
      const candidate = `${method.toUpperCase()}:${path}:${timestamp}:${nonce}:${fingerprintHash}`;
      const hash = await sha256Hex(candidate);
      if (hash.startsWith(targetPrefix)) {
        return { proof: hash, nonce, timestamp };
      }
    }
    return null;
  }
}
