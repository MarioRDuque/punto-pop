/**
 * Usuario - Entidad de dominio del frontend
 *
 * Representa al usuario en la lógica de la aplicación.
 * Usa nombres claros y agnósticos a la base de datos.
 */
export interface Usuario {
  email: string;
  nombre: string;
  apellidos: string;
  telefono?: string;
  direccion?: string;
  estado: boolean;
  roles?: ConfRolResumen[];
}

/**
 * ConfRolResumen - Rol asociado a un usuario
 * Coincide con ConfRolDto del backend
 */
export interface ConfRolResumen {
  rolCodigo: string;
  rolDescripcion?: string;
  rolEstado?: boolean;
}

/**
 * ConfUsuario - DTO para comunicación con el API
 *
 * Refleja la estructura que envía/recibe el backend.
 * Usa el prefijo "usu" propio del backend.
 * NO usar directamente en lógica de UI — usar Usuario.
 */
export class ConfUsuario {
  usuEmail: string;
  usuNombre: string;
  usuApellidos: string;
  usuClave: string;
  usuTelefono: string;
  usuDireccion: string;
  usuEstado: boolean;
  usuFoto?: string | null;
  roles?: ConfRolResumen[];

  constructor(values: Partial<ConfUsuario> = {}) {
    this.usuEmail = values.usuEmail ?? '';
    this.usuNombre = values.usuNombre ?? '';
    this.usuApellidos = values.usuApellidos ?? '';
    this.usuClave = values.usuClave ?? '';
    this.usuTelefono = values.usuTelefono ?? '';
    this.usuDireccion = values.usuDireccion ?? '';
    this.usuEstado = values.usuEstado ?? false;
    this.usuFoto = values.usuFoto ?? null;
    this.roles = values.roles ?? [];
  }

  toDomain(): Usuario {
    return {
      email: this.usuEmail,
      nombre: this.usuNombre,
      apellidos: this.usuApellidos,
      telefono: this.usuTelefono || undefined,
      direccion: this.usuDireccion || undefined,
      estado: this.usuEstado,
      roles: this.roles,
    };
  }

  static fromDomain(usuario: Usuario, clave = ''): ConfUsuario {
    return new ConfUsuario({
      usuEmail: usuario.email,
      usuNombre: usuario.nombre,
      usuApellidos: usuario.apellidos,
      usuClave: clave,
      usuTelefono: usuario.telefono ?? '',
      usuDireccion: usuario.direccion ?? '',
      usuEstado: usuario.estado,
      roles: usuario.roles,
    });
  }
}
