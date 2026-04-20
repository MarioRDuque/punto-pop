import { Injectable, signal } from '@angular/core';
import { ConfRolResumen } from '../entities/ConfUsuario';

export interface UsuarioSesion {
  username: string;
  nombre: string;
  apellidos: string;
  email: string;
  telefono?: string;
  direccion?: string;
  tiene2FA?: boolean;
  foto?: string | null;
  roles?: ConfRolResumen[];
  sucursales?: any[];
}

const SESSION_KEY = 'pp_sesion';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private _usuario = signal<UsuarioSesion | null>(null);

  /** Restaura la sesión desde localStorage (llamar en el inicializador de la app) */
  init() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        this._usuario.set(JSON.parse(raw));
      }
    } catch {
      localStorage.removeItem(SESSION_KEY);
    }
  }

  usuario() {
    return this._usuario();
  }

  setUsuario(usuario: UsuarioSesion | null) {
    this._usuario.set(usuario);
    if (usuario) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(usuario));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }

  logout() {
    this.setUsuario(null);
  }

  estaAutenticado(): boolean {
    return this._usuario() !== null;
  }

  actualizarFoto(foto: string | null) {
    const actual = this._usuario();
    if (actual) {
      this.setUsuario({ ...actual, foto });
    }
  }
}
