import { inject } from '@angular/core';
import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../service/toast.service';
import { CargandoService } from '../service/cargando.service';
import { AuthService } from '../service/auth.service';

export const errorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const toast = inject(ToastService);
  const cargando = inject(CargandoService);
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      cargando.inactivar();

      switch (error.status) {
        case 0:
          toast.error('No hay conexión con el servidor.', 'Error de Conexión');
          break;

        case 400:
          if (error.error?.errors) {
            const messages = Object.values<string>(error.error.errors);
            if (messages.length === 1) {
              toast.error(messages[0], error.error?.title || 'Error de Validación');
            } else {
              toast.errorMultiple(messages, error.error?.title || 'Error de Validación');
            }
          } else {
            toast.error(
              error.error?.detail || 'Contacte al administrador',
              error.error?.title || 'Error de Negocio'
            );
          }
          break;

        case 401:
          if (req.url.includes('/auth/login')) {
            toast.error('Usuario o contraseña incorrectos', 'Acceso denegado');
          } else {
            authService.logout();
            router.navigate(['/auth/login']);
          }
          break;

        case 403:
          if (!authService.tokenActual()) {
            authService.logout();
            router.navigate(['/auth/login']);
          } else {
            toast.error(
              error.error?.detail || 'No tienes permisos para esta acción',
              error.error?.title || 'Acceso denegado'
            );
          }
          break;

        default:
          toast.error(
            error.error?.detail || 'Contacte al administrador',
            error.status >= 500
              ? error.error?.title || 'Error del servidor'
              : error.error?.title || 'Error Desconocido'
          );
          break;
      }

      return throwError(() => error);
    })
  );
};
