import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceClientApi } from '../../core/services/service-client-api';

@Component({
  selector: 'app-produits',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="qa-card">
      <h2>Produits</h2>
      <button type="button" class="qa-btn qa-btn-primary" (click)="list()" [disabled]="loading()">Lister</button>
      <pre class="qa-pre">{{ output() }}</pre>
    </div>
  `,
  styles: []
})
export class PageProduits {
  loading = signal(false);
  output = signal<string>('');

  private readonly api = inject(ServiceClientApi);

  async list() {
    this.loading.set(true);
    try {
      const r = await this.api.get('/produits');
      this.output.set(JSON.stringify(r, null, 2));
    } finally {
      this.loading.set(false);
    }
  }
}
