export interface CatProducto {
  id?: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  precioVenta: number;
  costo?: number;
  stock: number;
  stockMinimo: number;
  foto?: string | null;
  estado: boolean;
  categoriaId: string;
  categoriaNombre?: string;
  unidadMedidaId: string;
  unidadMedidaNombre?: string;
  tarifaIvaId: string;
  tarifaIvaDescripcion?: string;
  porcentajeIva?: number;
}
