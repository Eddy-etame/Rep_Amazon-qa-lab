import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServiceClientApi } from '../../core/services/service-client-api';

/** Seeded by Amaz_back/db/postgres/seed.js (npm run db:postgres:seed). */
const QA_EMAIL = 'test@amaz.com';
const QA_PASSWORD = 'AmazQA2026!';

function pickAccessToken(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  const root = data as Record<string, unknown>;
  const inner = (root['data'] as Record<string, unknown> | undefined) ?? root;
  const t = inner['accessToken'] ?? inner['token'];
  return typeof t === 'string' && t.length > 0 ? t : null;
}

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="qa-card">
      <h2>Authentification</h2>
      <p class="qa-muted">
        Compte par défaut semé dans Postgres :
        <span class="qa-badge">{{ email }}</span>
        /
        <span class="qa-badge">AmazQA2026!</span>
        — lancez <code>npm run db:postgres:seed</code> depuis <code>Amaz_back</code> si la connexion échoue.
      </p>
      <div class="form">
        <input class="qa-input" [(ngModel)]="email" placeholder="Courriel" autocomplete="username" />
        <input
          class="qa-input"
          [(ngModel)]="password"
          type="password"
          placeholder="Mot de passe"
          autocomplete="current-password"
        />
      </div>
      <div class="actions">
        <button type="button" class="qa-btn qa-btn-secondary" (click)="register()" [disabled]="loading()">
          Inscription
        </button>
        <button type="button" class="qa-btn qa-btn-primary" (click)="login()" [disabled]="loading()">
          Connexion
        </button>
        <button type="button" class="qa-btn qa-btn-secondary" (click)="me()" [disabled]="loading()">
          Profil
        </button>
        <button type="button" class="qa-btn qa-btn-secondary" (click)="logout()" [disabled]="loading()">
          Déconnexion
        </button>
      </div>
      <pre class="qa-pre">{{ output() }}</pre>
    </div>
  `,
  styles: [`
    .form {
      display: flex;
      flex-wrap: wrap;
      gap: 0.65rem;
      margin: 1rem 0;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
  `]
})
export class PageAuth {
  email = QA_EMAIL;
  password = QA_PASSWORD;
  loading = signal(false);
  output = signal<string>('');

  private readonly api = inject(ServiceClientApi);

  private log(o: unknown) {
    this.output.set(JSON.stringify(o, null, 2));
  }

  async register() {
    this.loading.set(true);
    try {
      const r = await this.api.post('/auth/register', {
        email: this.email,
        password: this.password,
        username: 'qa_lab'
      });
      this.log(r);
      const tok = pickAccessToken(r.data);
      if (tok) this.api.setToken(tok);
    } finally {
      this.loading.set(false);
    }
  }

  async login() {
    this.loading.set(true);
    try {
      const r = await this.api.post('/auth/login', { email: this.email, password: this.password });
      this.log(r);
      const tok = pickAccessToken(r.data);
      if (tok) this.api.setToken(tok);
    } finally {
      this.loading.set(false);
    }
  }

  async me() {
    this.loading.set(true);
    try {
      const r = await this.api.get('/auth/me');
      this.log(r);
    } finally {
      this.loading.set(false);
    }
  }

  async logout() {
    this.loading.set(true);
    try {
      const r = await this.api.post('/auth/logout', {});
      this.log(r);
      this.api.setToken(null);
    } finally {
      this.loading.set(false);
    }
  }
}
