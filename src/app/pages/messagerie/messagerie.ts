import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceClientApi } from '../../core/services/service-client-api';

@Component({
  selector: 'app-messagerie',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="qa-card">
      <h2>Messagerie</h2>
      <p class="qa-muted">Connexion requise — authentifiez-vous d'abord dans Auth.</p>
      <button type="button" class="qa-btn qa-btn-primary" (click)="conversations()" [disabled]="loading()">Conversations</button>
      <pre class="qa-pre">{{ output() }}</pre>
    </div>
  `,
  styles: []
})
export class PageMessagerie {
  loading = signal(false);
  output = signal<string>('');

  private readonly api = inject(ServiceClientApi);

  async conversations() {
    this.loading.set(true);
    try {
      const r = await this.api.get('/messages/conversations');
      this.output.set(JSON.stringify(r, null, 2));
    } finally {
      this.loading.set(false);
    }
  }
}
