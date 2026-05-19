export type EstadoCompra = 'BORRADOR' | 'RECIBIDA' | 'ANULADA';

export interface DetalleCompra {
  id?: string;
  productoId: string;
  productoCodigo?: string;
  productoNombre?: string;
  cantidad: number;
  costoUnitario: number;
  subtotal?: number;
}

export interface Compra {
  id?: string;
  numero?: string;
  fecha?: string;
  proveedorId: string;
  proveedorNombre?: string;
  subtotal?: number;
  iva?: number;
  total?: number;
  estado?: EstadoCompra;
  observacion?: string;
  usuEmail?: string;
  detalles: DetalleCompra[];
}
