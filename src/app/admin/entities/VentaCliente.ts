export type TipoIdentificacion = 'RUC' | 'CEDULA' | 'PASAPORTE';

export interface VentaCliente {
  id?: string;
  tipoIdentificacion: TipoIdentificacion;
  identificacion: string;
  nombre: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  estado: boolean;
}
