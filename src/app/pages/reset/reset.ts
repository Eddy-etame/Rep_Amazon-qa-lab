import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiClientService } from '../../core/services/api-client.service';

@Component({
  selector: 'app-reset',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="qa-card">
      <h2>Reset password</h2>
      <p class="qa-muted">Get <code>resetToken</code> from OTP forgot → confirm.</p>
      <div class="qa-form-row">
        <input class="qa-input" [(ngModel)]="resetToken" placeholder="resetToken" />
        <input class="qa-input" [(ngModel)]="newPassword" type="password" placeholder="newPassword" />
        <button type="button" class="qa-btn qa-btn-primary" (click)="reset()" [disabled]="loading()">Reset</button>
      </div>
      <pre class="qa-pre">{{ output() }}</pre>
    </div>
  `,
  styles: []
})
export class ResetPage {
  resetToken = '';
  newPassword = 'newpassword123';
  loading = signal(false);
  output = signal<string>('');

  constructor(private api: ApiClientService) {}

  async reset() {
    this.loading.set(true);
    try {
      const r = await this.api.post('/auth/password/reset', {
        resetToken: this.resetToken,
        newPassword: this.newPassword
      });
      this.output.set(JSON.stringify(r, null, 2));
    } finally {
      this.loading.set(false);
    }
  }
}
