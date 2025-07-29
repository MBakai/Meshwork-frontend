import { Router, Routes } from '@angular/router';
import { dashboardRoutes } from './features/dashboard.routes';
import { MainComponent } from './features/auth/pages/main/main.component';
import { VerificationEmailComponent } from './features/auth/pages/verification-email/verification-email.component';
import { ResetPasswordComponent } from './features/auth/pages/reset-password/reset-password.component';
import { inject } from '@angular/core';
import { AuthService } from './core/auth-service/auth.service';
import { noAuthGuard } from './shared/guards/no-auth.guard';

export const routes: Routes = [
  
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '',
    canActivate: [() => {
      const router = inject(Router);
      const authService = inject(AuthService);
      if (authService.isAuthenticated()) {
        router.navigate(['/dashboard']);
      } else {
        router.navigate(['']);
      }
      return false;
    }]
  },
  {
    path: 'main',
    component: MainComponent
  },
  {
    path: '',
    loadComponent: () =>
      import('./features/auth/pages/main/main.component').then((c) => c.MainComponent),
    canActivate: [noAuthGuard],
  },
  {
    path: 'verify-account',
    component: VerificationEmailComponent
  },
  {
    path: 'recovery-password',
    component: ResetPasswordComponent
  },
  {
    path: '',
    children: dashboardRoutes
  },
  {
  path: '**',
  loadComponent: () =>
    import('./shared/pages/not-found/not-found.component').then(
      m => m.NotFoundComponent
    ),
 }
];