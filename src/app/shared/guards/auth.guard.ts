import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../core/auth-service/auth.service';
import { inject } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { JwtPayload } from '../../core/auth-service/interface/JwtPayload.interface';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getAccessToken();

  if (token && !isTokenExpired(token)) {
    return true;
  }

  // Token expirado o ausente: intentamos refrescar
  return authService.refreshToken().pipe(
    map((newToken: string) => {
      authService.saveAccessToken(newToken);
      return true;
    }),
    catchError((err) => {
      console.warn('No se pudo refrescar el token:', err);
      authService.logout(); 
      router.navigate(['']);
      return of(false);
    })
  );
};

function isTokenExpired(token: string): boolean {
  try {
    const decoded: JwtPayload = jwtDecode<JwtPayload>(token);
    const now = Date.now() / 1000;
    return decoded.exp < now;
  } catch (err) {
    return true;
  }
}
