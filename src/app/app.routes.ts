import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'health', pathMatch: 'full' },
  { path: 'health', loadComponent: () => import('./pages/health/health').then((m) => m.HealthPage) },
  { path: 'run-all', loadComponent: () => import('./pages/run-all/run-all').then((m) => m.RunAllPage) },
  { path: 'auth', loadComponent: () => import('./pages/auth/auth').then((m) => m.AuthPage) },
  { path: 'otp', loadComponent: () => import('./pages/otp/otp').then((m) => m.OtpPage) },
  { path: 'reset', loadComponent: () => import('./pages/reset/reset').then((m) => m.ResetPage) },
  { path: 'products', loadComponent: () => import('./pages/products/products').then((m) => m.ProductsPage) },
  { path: 'orders', loadComponent: () => import('./pages/orders/orders').then((m) => m.OrdersPage) },
  { path: 'messaging', loadComponent: () => import('./pages/messaging/messaging').then((m) => m.MessagingPage) },
  { path: 'ai', loadComponent: () => import('./pages/ai/ai').then((m) => m.AiPage) }
];
