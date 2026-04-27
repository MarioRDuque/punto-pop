export type EstadoComprobante = 'PENDIENTE' | 'ENVIADO' | 'AUTORIZADO' | 'DEVUELTO' | 'ERROR';

export interface Comprobante {
  id?: string;
  ventaId: string;
  claveAcceso?: string;
  numeroComprobante?: string;
  estado: EstadoComprobante;
  numeroAutorizacion?: string;
  fechaAutorizacion?: string;
  mensajeError?: string;
}
