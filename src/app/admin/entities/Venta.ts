import { VentaCliente } from './VentaCliente';

export type EstadoVenta = 'PENDIENTE' | 'COMPLETADA' | 'ANULADA';
export type FormaPago = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'CREDITO' | 'POR_PAGAR';

export interface ItemVenta {
  id?: string;
  productoId: string;
  productoCodigo: string;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  subtotal: number;
  porcentajeIva?: number;
  codigoSriIva?: string;
}

export interface Venta {
  id?: string;
  numero?: string;
  fecha?: string;
  subtotal: number;
  descuento: number;
  baseIva: number;
  baseExenta: number;
  iva: number;
  total: number;
  estado?: EstadoVenta;
  formaPago: FormaPago;
  observacion?: string;
  usuUsername?: string;
  cliente?: VentaCliente;
  clienteId?: string;
  clienteNombre?: string;
  items: ItemVenta[];
}
