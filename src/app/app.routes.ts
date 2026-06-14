import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'sante', pathMatch: 'full' },
  { path: 'sante', loadComponent: () => import('./pages/sante/sante').then((m) => m.PageSante) },
  { path: 'execution-complete', loadComponent: () => import('./pages/execution-complete/execution-complete').then((m) => m.PageExecutionComplete) },
  { path: 'auth', loadComponent: () => import('./pages/auth/auth').then((m) => m.PageAuth) },
  { path: 'otp', loadComponent: () => import('./pages/otp/otp').then((m) => m.PageOtp) },
  { path: 'reinitialisation', loadComponent: () => import('./pages/reinitialisation/reinitialisation').then((m) => m.PageReinitialisation) },
  { path: 'produits', loadComponent: () => import('./pages/produits/produits').then((m) => m.PageProduits) },
  { path: 'commandes', loadComponent: () => import('./pages/commandes/commandes').then((m) => m.PageCommandes) },
  { path: 'messagerie', loadComponent: () => import('./pages/messagerie/messagerie').then((m) => m.PageMessagerie) },
  { path: 'ia', loadComponent: () => import('./pages/ia/ia').then((m) => m.PageIA) }
];
