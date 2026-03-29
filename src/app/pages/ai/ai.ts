import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiClientService } from '../../core/services/api-client.service';

@Component({
  selector: 'app-ai',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="qa-card">
      <h2>AI</h2>
      <button type="button" class="qa-btn qa-btn-primary" (click)="recommend()" [disabled]="loading()">Recommendations</button>
      <pre class="qa-pre">{{ output() }}</pre>
    </div>
  `,
  styles: []
})
export class AiPage {
  loading = signal(false);
  output = signal<string>('');

  constructor(private api: ApiClientService) {}

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
