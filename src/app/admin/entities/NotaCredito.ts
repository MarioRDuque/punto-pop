import { EstadoComprobante } from './Comprobante';

export interface NotaCreditoItem {
  productoId?: string;
  productoCodigo?: string;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  subtotal: number;
}

export interface NotaCredito {
  id?: string;
  comprobanteId?: string;
  claveAcceso?: string;
  numeroComprobante?: string;
  motivo?: string;
  restaurarStock?: boolean;
  fechaEmision?: string;
  estado?: EstadoComprobante;
  numeroAutorizacion?: string;
  fechaAutorizacion?: string;
  mensajesSri?: string;
  items?: NotaCreditoItem[];
}

export interface NotaCreditoRequest {
  motivo: string;
  restaurarStock: boolean;
  items: NotaCreditoRequestItem[];
}

export interface NotaCreditoRequestItem {
  productoId: string;
  productoCodigo: string;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  subtotal: number;
}
