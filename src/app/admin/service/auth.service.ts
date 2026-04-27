import { Injectable, computed, signal } from '@angular/core';
import { z } from 'zod';

const SESSION_KEY = 'pp_sesion';

const ConfRolResumenSchema = z.object({
  rolCodigo: z.string(),
  rolDescripcion: z.string().optional(),
  rolEstado: z.boolean().optional(),
  permisos: z.array(z.string()).optional().default([]),
});

export const UsuarioSesionSchema = z.object({
  token: z.string(),
  username: z.string().min(1),
  nombre: z.string(),
  apellidos: z.string().nullish().transform(v => v ?? ''),
  email: z.string().nullish().transform(v => v ?? ''),
  telefono: z.string().nullish(),
  direccion: z.string().nullish(),
  tiene2FA: z.boolean().optional(),
  foto: z.string().nullish(),
  roles: z.array(ConfRolResumenSchema).optional(),
  sucursales: z.array(z.unknown()).optional(),
  permisos: z.array(z.string()).nullish().transform(v => v ?? []),
});

export type UsuarioSesion = z.infer<typeof UsuarioSesionSchema>;
export type ConfRolResumen = z.infer<typeof ConfRolResumenSchema>;

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly _usuario = signal<UsuarioSesion | null>(null);

  readonly usuario = computed(() => this._usuario());
  readonly estaAutenticado = computed(() => this._usuario() !== null);

  /** Restaura la sesión desde localStorage al arrancar la app */
  init(): void {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return;
      const parsed = UsuarioSesionSchema.safeParse(JSON.parse(raw));
      if (parsed.success) {
        this._usuario.set(parsed.data);
      } else {
        console.warn('[AuthService] Sesión inválida, se limpia:', parsed.error.issues);
        localStorage.removeItem(SESSION_KEY);
      }
    } catch {
      localStorage.removeItem(SESSION_KEY);
    }
  }

  setUsuario(usuario: UsuarioSesion | null): void {
    this._usuario.set(usuario);
    if (usuario) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(usuario));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }

  logout(): void {
    this.setUsuario(null);
  }

  tokenActual(): string | null {
    return this._usuario()?.token ?? null;
  }

  actualizarFoto(foto: string | null): void {
    const actual = this._usuario();
    if (actual) {
      this.setUsuario({ ...actual, foto });
    }
  }

  tieneRol(rol: string): boolean {
    return this._usuario()?.roles?.some(r => r.rolCodigo === rol) ?? false;
  }

  tienePermiso(permiso: string): boolean {
    return this._usuario()?.permisos?.includes(permiso) ?? false;
  }
}
