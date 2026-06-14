import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServiceClientApi } from '../../core/services/service-client-api';

@Component({
  selector: 'app-otp',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="qa-card">
      <h2>OTP (vérification / mot de passe oublié)</h2>
      <div class="qa-form-row">
        <input class="qa-input" [(ngModel)]="email" placeholder="courriel" />
        <select class="qa-input" [(ngModel)]="channel">
          <option value="email">courriel</option>
          <option value="sms">sms</option>
        </select>
        <button type="button" class="qa-btn qa-btn-primary" (click)="startVerification()" [disabled]="loading()">Lancer vérification</button>
        <button type="button" class="qa-btn qa-btn-secondary" (click)="startForgot()" [disabled]="loading()">Lancer oubli</button>
      </div>
      <div class="qa-form-row">
        <input class="qa-input" [(ngModel)]="otpRequestId" placeholder="otpRequestId" />
        <input class="qa-input" [(ngModel)]="code" placeholder="code" />
        <button type="button" class="qa-btn qa-btn-primary" (click)="confirmVerification()" [disabled]="loading()">Confirmer vérification</button>
        <button type="button" class="qa-btn qa-btn-secondary" (click)="confirmForgot()" [disabled]="loading()">Confirmer oubli</button>
      </div>
      <pre class="qa-pre">{{ output() }}</pre>
    </div>
  `,
  styles: []
})
export class PageOtp {
  email = 'test@amaz.com';
  channel = 'email';
  otpRequestId = '';
  code = '';
  resetToken = '';
  loading = signal(false);
  output = signal<string>('');

  private readonly api = inject(ServiceClientApi);

  private log(o: unknown) {
    this.output.set(JSON.stringify(o, null, 2));
  }

  async startVerification() {
    this.loading.set(true);
    try {
      const r = await this.api.post('/auth/verification/start', { email: this.email, channel: this.channel });
      this.log(r);
      const d = r.data as { data?: { otpRequestId?: string; debugCode?: string } };
      if (d?.data?.otpRequestId) this.otpRequestId = d.data.otpRequestId;
      if (d?.data?.debugCode) this.code = d.data.debugCode;
    } finally {
      this.loading.set(false);
    }
  }

  async startForgot() {
    this.loading.set(true);
    try {
      const r = await this.api.post('/auth/password/forgot/start', { email: this.email, channel: this.channel });
      this.log(r);
      const d = r.data as { data?: { otpRequestId?: string; debugCode?: string } };
      if (d?.data?.otpRequestId) this.otpRequestId = d.data.otpRequestId;
      if (d?.data?.debugCode) this.code = d.data.debugCode;
    } finally {
      this.loading.set(false);
    }
  }

  async confirmVerification() {
    this.loading.set(true);
    try {
      const r = await this.api.post('/auth/verification/confirm', { otpRequestId: this.otpRequestId, code: this.code });
      this.log(r);
    } finally {
      this.loading.set(false);
    }
  }

  async confirmForgot() {
    this.loading.set(true);
    try {
      const r = await this.api.post('/auth/password/forgot/confirm', { otpRequestId: this.otpRequestId, code: this.code });
      this.log(r);
      const d = r.data as { data?: { resetToken?: string } };
      if (d?.data?.resetToken) this.resetToken = d.data.resetToken;
    } finally {
      this.loading.set(false);
    }
  }
}
