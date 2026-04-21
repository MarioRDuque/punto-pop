import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../service/api.service';

/**
 * Servicio para gestión de perfil de usuario
 * Requisitos: 17.1, 17.2, 17.3, 17.4, 17.5
 */
@Injectable({ providedIn: 'root' })
export class PerfilService {
  private api = inject(ApiService);

  /**
   * Valida contraseña según requisito 17.2:
   * - Mínimo 8 caracteres
   * - Al menos una mayúscula
   * - Al menos un número
   * - Al menos un carácter especial
   */
  validarContraseña(password: string): boolean {
    if (password.length < 8) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[0-9]/.test(password)) return false;
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return false;
    return true;
  }

  /**
   * Cambia la contraseña del usuario
   * Requisito 17.2
   */
  cambiarContraseña(data: {
    contraseñaActual: string;
    contraseñaNueva: string;
    confirmacion: string;
  }): Observable<void> {
    return this.api.post('/perfil/cambiar-contraseña', data);
  }

  /**
   * Guarda preferencias del usuario
   * Requisito 17.4
   */
  guardarPreferencias(preferencias: any): Observable<void> {
    return this.api.post('/perfil/preferencias', preferencias);
  }

  /**
   * Obtiene preferencias del usuario
   * Requisito 17.4
   */
  obtenerPreferencias(): Observable<any> {
    return this.api.get('/perfil/preferencias');
  }

  /**
   * Actualiza datos personales del usuario
   * Requisito 17.1
   */
  actualizarDatosPersonales(datos: any): Observable<void> {
    return this.api.put('/perfil/datos-personales', datos);
  }

  /**
   * Obtiene historial de sesiones
   * Requisito 17.5
   */
  obtenerHistorialSesiones(): Observable<any[]> {
    return this.api.get('/perfil/sesiones');
  }

  /**
   * Cierra una sesión remota
   * Requisito 17.5
   */
  cerrarSesionRemota(sesionId: string): Observable<void> {
    return this.api.post(`/perfil/sesiones/${sesionId}/cerrar`, {});
  }
}
