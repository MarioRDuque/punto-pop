import { EstadoComprobante } from './Comprobante';

export interface NotaDebitoMotivo {
  descripcion: string;
  valor: number;
}

export interface NotaDebito {
  id?: string;
  comprobanteId?: string;
  claveAcceso?: string;
  numeroComprobante?: string;
  fechaEmision?: string;
  estado?: EstadoComprobante;
  numeroAutorizacion?: string;
  fechaAutorizacion?: string;
  mensajesSri?: string;
  motivos?: NotaDebitoMotivo[];
}

export interface NotaDebitoRequest {
  motivos: NotaDebitoMotivo[];
}
