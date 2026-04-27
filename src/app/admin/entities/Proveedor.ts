export interface Proveedor {
  id?: string;
  ruc: string;
  razonSocial: string;
  nombreComercial?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  estado: boolean;
}
