export class ConfUsuario {
    usuUsername: string;
    usuNombre: string;
    usuApellidos: string;
    usuEmail: string;
    usuClave: string;
    usuTelefono: string;
    usuDireccion: string;
    usuEstado: boolean;

    constructor(values: Partial<ConfUsuario> = {}) {
        this.usuUsername = values.usuUsername ?? '';
        this.usuNombre = values.usuNombre ?? '';
        this.usuApellidos = values.usuApellidos ?? '';
        this.usuEmail = values.usuEmail ?? '';
        this.usuClave = values.usuClave ?? '';
        this.usuTelefono = values.usuTelefono ?? '';
        this.usuDireccion = values.usuDireccion ?? '';
        this.usuEstado = values.usuEstado ?? false;
    }
}