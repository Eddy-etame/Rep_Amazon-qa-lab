import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-root">
      <nav class="nav-bar">
        <span class="nav-brand">Amaz QA Lab</span>
        <a routerLink="/sante" routerLinkActive="active">Santé</a>
        <a routerLink="/execution-complete" routerLinkActive="active">Tout exécuter</a>
        <a routerLink="/auth" routerLinkActive="active">Auth</a>
        <a routerLink="/otp" routerLinkActive="active">OTP</a>
        <a routerLink="/reinitialisation" routerLinkActive="active">Réinitialisation</a>
        <a routerLink="/produits" routerLinkActive="active">Produits</a>
        <a routerLink="/commandes" routerLinkActive="active">Commandes</a>
        <a routerLink="/messagerie" routerLinkActive="active">Messagerie</a>
        <a routerLink="/ia" routerLinkActive="active">IA</a>
      </nav>
      <main class="main-area">
        <router-outlet />
      </main>
    </div>
  `,
  styleUrl: './app.scss'
})
export class App {}
