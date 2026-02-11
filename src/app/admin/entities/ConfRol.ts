export class ConfRol {
    rolCodigo: string;
    rolDescripcion: string;
    rolEstado: boolean;

    constructor(values: Partial<ConfRol> = {}) {
        this.rolCodigo = values.rolCodigo ?? '';
        this.rolDescripcion = values.rolDescripcion ?? '';
        this.rolEstado = values.rolEstado ?? false;
    }
}