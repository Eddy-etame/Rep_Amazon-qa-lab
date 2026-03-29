import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { resolveGatewayBase } from '../../core/utils/gateway-url';

@Component({
  selector: 'app-health',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="qa-card">
      <h2>Health checks</h2>
      <p class="qa-muted">
        Uses gateway <code>{{ gatewayPreview }}</code> — same hostname as this page.
      </p>
      <button type="button" class="qa-btn qa-btn-primary" (click)="runAll()" [disabled]="loading()">
        {{ loading() ? 'Running…' : 'Run all checks' }}
      </button>
      <div class="results" *ngIf="results().length">
        <div
          *ngFor="let r of results()"
          class="row"
          [class.ok]="r.ok"
          [class.fail]="!r.ok"
        >
          <span class="name">{{ r.name }}</span>
          <span class="meta">{{ r.ok ? 'OK' : 'FAIL' }} ({{ r.status }}){{ r.hint ? ' — ' + r.hint : '' }}</span>
        </div>
      </div>
      <p *ngIf="errorMsg()" class="err">{{ errorMsg() }}</p>
      <p *ngIf="hasFailures() && !errorMsg()" class="qa-muted tip">
        If only <strong>User</strong> fails: restart the stack so the gateway waits for user-service health
        (<code>docker compose -f docker-compose.full.yml up -d --build</code>).
      </p>
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
      gap: 0.5rem;
    }
    .row {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 0.5rem;
      padding: 0.55rem 0.75rem;
      border-radius: 8px;
      background: var(--qa-bg);
      border: 1px solid var(--qa-border);
      font-size: 0.9rem;
    }
    .row.ok .name { color: var(--qa-success); }
    .row.fail .name { color: var(--qa-danger); }
    .meta { color: var(--qa-muted); font-family: ui-monospace, monospace; font-size: 0.8rem; }
    .err {
      margin-top: 1rem;
      padding: 0.75rem;
      border-radius: 8px;
      background: rgba(255, 92, 92, 0.12);
      border: 1px solid rgba(255, 92, 92, 0.35);
      color: #ffb4b4;
      font-size: 0.875rem;
      max-width: 42rem;
    }
    .tip {
      margin-top: 1rem;
      max-width: 40rem;
    }
  `]
})
export class HealthPage {
  loading = signal(false);
  results = signal<{ name: string; ok: boolean; status: number; hint?: string }[]>([]);
  errorMsg = signal<string>('');
  gatewayPreview = resolveGatewayBase();

  async runAll() {
    this.loading.set(true);
    this.results.set([]);
    this.errorMsg.set('');
    const res: { name: string; ok: boolean; status: number; hint?: string }[] = [];
    const gw = resolveGatewayBase();
    this.gatewayPreview = gw;
    try {
      const r = await fetch(`${gw}/health/aggregate`);
      const body = await r.json().catch(() => ({}));
      const data = body?.data ?? {};
      const gateway = data.gateway ?? {};
      res.push({
        name: 'Gateway',
        ok: gateway.status === 'ok' && gateway.code === 200,
        status: gateway.code ?? (r.ok ? 200 : 0)
      });
      const services = data.services ?? {};
      const names: { key: string; label: string }[] = [
        { key: 'user', label: 'User' },
        { key: 'product', label: 'Product' },
        { key: 'order', label: 'Order' },
        { key: 'messaging', label: 'Messaging' },
        { key: 'ai', label: 'AI' },
        { key: 'pepper', label: 'Pepper' }
      ];
      for (const { key, label } of names) {
        const svc = services[key] ?? {};
        const ok = svc.status === 'ok' && svc.code === 200;
        const hint = svc.error ? String(svc.error) : undefined;
        res.push({ name: label, ok, status: svc.code ?? 0, hint });
      }
    } catch (e: unknown) {
      const msg =
        e instanceof TypeError
          ? `Cannot reach gateway at ${gw} (network/CORS). Use the same host for QA Lab and gateway, or add your origin to CORS.`
          : e instanceof Error
            ? e.message
            : String(e);
      this.errorMsg.set(msg);
      res.push({ name: 'Gateway', ok: false, status: 0 });
      for (const label of ['User', 'Product', 'Order', 'Messaging', 'AI', 'Pepper']) {
        res.push({ name: label, ok: false, status: 0 });
      }
    }
    this.results.set(res);
    this.loading.set(false);
  }

  hasFailures(): boolean {
    return this.results().some((r) => !r.ok);
  }
}
