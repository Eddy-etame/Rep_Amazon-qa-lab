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
        <a routerLink="/health" routerLinkActive="active">Health</a>
        <a routerLink="/run-all" routerLinkActive="active">Run all</a>
        <a routerLink="/auth" routerLinkActive="active">Auth</a>
        <a routerLink="/otp" routerLinkActive="active">OTP</a>
        <a routerLink="/reset" routerLinkActive="active">Reset</a>
        <a routerLink="/products" routerLinkActive="active">Products</a>
        <a routerLink="/orders" routerLinkActive="active">Orders</a>
        <a routerLink="/messaging" routerLinkActive="active">Messaging</a>
        <a routerLink="/ai" routerLinkActive="active">AI</a>
      </nav>
      <main class="main-area">
        <router-outlet />
      </main>
    </div>
  `,
  styleUrl: './app.scss'
})
export class App {}
