import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceClientApi } from '../../core/services/service-client-api';

@Component({
  selector: 'app-ia',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="qa-card">
      <h2>IA</h2>
      <button type="button" class="qa-btn qa-btn-primary" (click)="recommend()" [disabled]="loading()">Recommandations</button>
      <pre class="qa-pre">{{ output() }}</pre>
    </div>
  `,
  styles: []
})
export class PageIA {
  loading = signal(false);
  output = signal<string>('');

  private readonly api = inject(ServiceClientApi);

  async recommend() {
    this.loading.set(true);
    try {
      const r = await this.api.post('/ai/recommendations', { query: 'laptop' });
      this.output.set(JSON.stringify(r, null, 2));
    } finally {
      this.loading.set(false);
    }
  }
}
