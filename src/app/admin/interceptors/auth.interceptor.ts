import { inject } from '@angular/core';
import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { AuthService } from '../service/auth.service';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const token = inject(AuthService).tokenActual();
  const esRutaPublicaDeAuth =
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/forgot-password') ||
    req.url.includes('/auth/reset-password');

  if (!token || esRutaPublicaDeAuth) {
    return next(req);
  }

  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
