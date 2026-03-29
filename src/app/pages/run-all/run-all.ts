import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiClientService } from '../../core/services/api-client.service';
import { resolveGatewayBase } from '../../core/utils/gateway-url';

@Component({
  selector: 'app-run-all',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="qa-card">
      <h2>QA campaign (gateway + PoW)</h2>
      <p class="qa-muted">
        Full API smoke: aggregate health, catalogue, register/login, me, orders, AI, messaging, bot.
        Gateway: <code>{{ gateway }}</code>. Seeded login fallback: <span class="qa-badge">test@amaz.com</span>
      </p>
      <button type="button" class="qa-btn qa-btn-primary" (click)="run()" [disabled]="loading()">
        {{ loading() ? 'Running…' : 'Run all tests' }}
      </button>
      <div class="results" *ngIf="results().length">
        <div *ngFor="let r of results()" class="row" [class.pass]="r.pass" [class.fail]="!r.pass">
          <span class="name">{{ r.name }}</span>
          <span class="detail">{{ r.pass ? 'PASS' : 'FAIL' }}{{ r.detail ? ' — ' + r.detail : '' }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    code {
      font-size: 0.85em;
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
      background: var(--qa-bg);
      border: 1px solid var(--qa-border);
    }
    .results {
      margin-top: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }
    .row {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      border-radius: 8px;
      background: var(--qa-bg);
      border: 1px solid var(--qa-border);
      font-size: 0.88rem;
    }
    .row.pass .name { color: var(--qa-success); }
    .row.fail .name { color: var(--qa-danger); }
    .detail { font-family: ui-monospace, monospace; font-size: 0.78rem; color: var(--qa-muted); }
  `]
})
export class RunAllPage {
  loading = signal(false);
  results = signal<{ name: string; pass: boolean; detail?: string }[]>([]);
  gateway = resolveGatewayBase();

  constructor(private api: ApiClientService) {}

  private push(
    list: { name: string; pass: boolean; detail?: string }[],
    name: string,
    pass: boolean,
    detail?: string | number | null
  ) {
    list.push({
      name,
      pass,
      detail: detail !== undefined && detail !== null && detail !== '' ? String(detail) : undefined
    });
  }

  async run() {
    this.loading.set(true);
    this.results.set([]);
    const res: { name: string; pass: boolean; detail?: string }[] = [];

    try {
      const aggRes = await fetch(`${resolveGatewayBase()}/health/aggregate`);
      const aggBody = await aggRes.json().catch(() => ({}));
      const aggData = aggBody?.data ?? {};
      const gateway = aggData.gateway ?? {};
      this.push(
        res,
        'Gateway health (aggregate)',
        gateway.status === 'ok' && gateway.code === 200,
        gateway.code
      );

      const services = aggData.services ?? {};
      const svcNames: { key: string; label: string }[] = [
        { key: 'user', label: 'Downstream: user' },
        { key: 'product', label: 'Downstream: product' },
        { key: 'order', label: 'Downstream: order' },
        { key: 'messaging', label: 'Downstream: messaging' },
        { key: 'ai', label: 'Downstream: ai' },
        { key: 'pepper', label: 'Downstream: pepper' }
      ];
      for (const { key, label } of svcNames) {
        const svc = services[key] ?? {};
        const pass = svc.status === 'ok' && svc.code === 200;
        const err = svc.error ? ` ${svc.error}` : '';
        this.push(res, label, pass, `${svc.status ?? '?'} ${svc.code ?? 0}${err}`);
      }

      const rProducts = await this.api.get<Record<string, unknown>>('/produits');
      const pdata = rProducts.data as Record<string, unknown> | undefined;
      const inner = (pdata?.['data'] as Record<string, unknown> | undefined) ?? pdata;
      const items = (inner?.['items'] as unknown[]) ?? [];
      const prodOk = rProducts.status === 200 && Array.isArray(items);
      this.push(res, 'GET /api/v1/produits', prodOk, `${rProducts.status} items=${items.length}`);

      const first = items[0] as Record<string, unknown> | undefined;
      const firstId = first?.['id'] != null ? String(first['id']) : '';
      const vendorId = first?.['vendorId'] != null ? String(first['vendorId']) : '';

      if (firstId) {
        const one = await this.api.get(`/produits/${encodeURIComponent(firstId)}`);
        this.push(res, 'GET /api/v1/produits/:id', one.status === 200, one.status);
      } else {
        this.push(res, 'GET /api/v1/produits/:id', false, 'skipped (empty catalogue — db:bootstrap)');
      }

      const testEmail = `qa_${Date.now()}@test.local`;
      const testPassword = 'QaTest12!'; // min 8 chars
      const rRegister = await this.api.post('/auth/register', {
        email: testEmail,
        password: testPassword,
        username: 'qa_run'
      });
      const regOk = rRegister.status === 201 || rRegister.status === 200;
      this.push(res, 'POST /api/v1/auth/register', regOk, rRegister.status);

      let token: string | null = null;
      const rLogin = await this.api.post<Record<string, unknown>>('/auth/login', {
        email: testEmail,
        password: testPassword
      });
      if (rLogin.status === 200 && rLogin.data) {
        const d = rLogin.data as Record<string, unknown>;
        const pack = (d?.['data'] as Record<string, unknown> | undefined) ?? d;
        token =
          (pack?.['accessToken'] ?? pack?.['token']) != null
            ? String(pack['accessToken'] ?? pack['token'])
            : null;
      }
      if (!token && regOk) {
        await new Promise((r) => setTimeout(r, 400));
        const retry = await this.api.post<Record<string, unknown>>('/auth/login', {
          email: testEmail,
          password: testPassword
        });
        if (retry.status === 200 && retry.data) {
          const d = retry.data as Record<string, unknown>;
          const pack = (d?.['data'] as Record<string, unknown> | undefined) ?? d;
          token =
            (pack?.['accessToken'] ?? pack?.['token']) != null
              ? String(pack['accessToken'] ?? pack['token'])
              : null;
        }
      }
      if (!token) {
        const fallbacks = [
          { email: 'test@amaz.com', password: 'AmazQA2026!' },
          { email: 'eddy.etame@enkoschools.com', password: 'Amaz@2026!' }
        ];
        for (const cred of fallbacks) {
          const fb = await this.api.post<Record<string, unknown>>('/auth/login', cred);
          if (fb.status === 200 && fb.data) {
            const d = fb.data as Record<string, unknown>;
            const pack = (d?.['data'] as Record<string, unknown> | undefined) ?? d;
            token =
              (pack?.['accessToken'] ?? pack?.['token']) != null
                ? String(pack['accessToken'] ?? pack['token'])
                : null;
            if (token) break;
          }
        }
      }

      this.push(res, 'POST /api/v1/auth/login', Boolean(token), rLogin.status);
      if (token) this.api.setToken(token);

      if (token) {
        const me = await this.api.get('/auth/me');
        this.push(res, 'GET /api/v1/auth/me', me.status === 200, me.status);

        const ord = await this.api.get('/commandes');
        this.push(res, 'GET /api/v1/commandes', ord.status === 200, ord.status);

        const rAi = await this.api.post('/ai/recommendations', { query: 'test', limit: 4 });
        this.push(res, 'POST /api/v1/ai/recommendations', rAi.status === 200, rAi.status);

        if (firstId && vendorId) {
          const conv = await this.api.get('/messages/conversations');
          this.push(
            res,
            'GET /api/v1/messages/conversations',
            conv.status === 200,
            conv.status
          );

          const rMsg = await this.api.post('/messages', {
            content: 'QA run-all message',
            vendorId,
            productId: firstId,
            subject: 'QA'
          });
          this.push(
            res,
            'POST /api/v1/messages',
            rMsg.status === 201 || rMsg.status === 200,
            rMsg.status
          );
        } else {
          this.push(res, 'GET /api/v1/messages/conversations', false, 'skipped (no product)');
          this.push(res, 'POST /api/v1/messages', false, 'skipped (no product/vendor)');
        }
      } else {
        this.push(res, 'GET /api/v1/auth/me', false, 'no token');
        this.push(res, 'GET /api/v1/commandes', false, 'no token');
        this.push(res, 'POST /api/v1/ai/recommendations', false, 'no token');
        this.push(res, 'GET /api/v1/messages/conversations', false, 'no token');
        this.push(res, 'POST /api/v1/messages', false, 'no token');
      }

      const bot = await this.api.postWithoutAuth('/bot/auth', { etat: 'ok', action: 'qa-run-all' });
      this.push(
        res,
        'POST /api/v1/bot/auth (PoW only, no Bearer)',
        bot.status === 200 && (bot.data as Record<string, unknown>)?.['success'] === true,
        bot.status
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      this.push(res, 'Run-all fatal', false, msg);
    } finally {
      this.results.set(res);
      this.loading.set(false);
    }
  }
}
