import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiClientService } from '../../core/services/api-client.service';

@Component({
  selector: 'app-messaging',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="qa-card">
      <h2>Messaging</h2>
      <p class="qa-muted">Login required — sign in on Auth first.</p>
      <button type="button" class="qa-btn qa-btn-primary" (click)="conversations()" [disabled]="loading()">Conversations</button>
      <pre class="qa-pre">{{ output() }}</pre>
    </div>
  `,
  styles: []
})
export class MessagingPage {
  loading = signal(false);
  output = signal<string>('');

  constructor(private api: ApiClientService) {}

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
