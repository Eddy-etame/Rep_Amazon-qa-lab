import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiClientService } from '../../core/services/api-client.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="qa-card">
      <h2>Products</h2>
      <button type="button" class="qa-btn qa-btn-primary" (click)="list()" [disabled]="loading()">List</button>
      <pre class="qa-pre">{{ output() }}</pre>
    </div>
  `,
  styles: []
})
export class ProductsPage {
  loading = signal(false);
  output = signal<string>('');

  constructor(private api: ApiClientService) {}

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
