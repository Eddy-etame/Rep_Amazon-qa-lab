import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServiceClientApi } from '../../core/services/service-client-api';

@Component({
  selector: 'app-reinitialisation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="qa-card">
      <h2>Réinitialisation du mot de passe</h2>
      <p class="qa-muted">Obtenez le <code>resetToken</code> depuis OTP oubli → confirmer.</p>
      <div class="qa-form-row">
        <input class="qa-input" [(ngModel)]="resetToken" placeholder="resetToken" />
        <input class="qa-input" [(ngModel)]="newPassword" type="password" placeholder="nouveauMotDePasse" />
        <button type="button" class="qa-btn qa-btn-primary" (click)="reset()" [disabled]="loading()">Réinitialiser</button>
      </div>
      <pre class="qa-pre">{{ output() }}</pre>
    </div>
  `,
  styles: []
})
export class PageReinitialisation {
  resetToken = '';
  newPassword = 'newpassword123';
  loading = signal(false);
  output = signal<string>('');

  private readonly api = inject(ServiceClientApi);

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
