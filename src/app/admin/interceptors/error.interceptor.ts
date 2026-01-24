import { inject } from '@angular/core';
import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../service/toast.service';
import { CargandoService } from '../service/cargando.service';

export const errorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
) => {

  const messageService = inject(ToastService);
  let cargando = inject(CargandoService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {

      switch (error.status) {
        case 0:
          messageService.error(
            'No hay conexión con el servidor.',
            'Error de Conexión'
          );
          break;
        case 400:
          if (error.error?.errors) {
            //mejorar esto en un modal
            let mensaje = Object.values(error.error.errors).join('\n');
            messageService.error(
              mensaje,
              error.error?.title || 'Error de Negocio'
            );
          } else {
            messageService.error(
              error.error?.detail || 'Contacte al administrador',
              'Error de Negocio'
            );
          }
          break;
        case 401:
          messageService.warn(
            error.error?.detail || 'Vuelve a iniciar sesión',
            'Sesión expirada'
          );
          break;
        case 403:
          messageService.error(
            error.error?.detail || 'No tienes permisos',
            'Acceso denegado'
          );
          break;
        default:
          if (error.status >= 500) {
            messageService.error(
              error.error?.detail || 'Contacte al administrador',
              'Error del servidor'
            );
          } else {
            messageService.error(
              error.error?.detail || 'Contacte al administrador',
              'Error Desconocido'
            );
          }
          break;
      }
      cargando.inactivar();
      return throwError(() => error);

    })
  );
};
