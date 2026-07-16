export interface AccionPermiso {
  codigo: string;
  label: string;
}

export interface ModuloPermiso {
  modulo: string;
  label: string;
  acciones: AccionPermiso[];
}

export const MODULOS_PERMISOS: ModuloPermiso[] = [
  {
    modulo: 'VENTAS',
    label: 'Ventas',
    acciones: [
      { codigo: 'VENTAS_VER', label: 'Ver' },
      { codigo: 'VENTAS_CREAR', label: 'Crear' },
      { codigo: 'VENTAS_EDITAR', label: 'Editar' },
      { codigo: 'VENTAS_ELIMINAR', label: 'Eliminar' },
      { codigo: 'VENTAS_ANULAR', label: 'Anular' },
    ],
  },
  {
    modulo: 'FACTURACION',
    label: 'Facturación',
    acciones: [
      { codigo: 'FACTURACION_VER', label: 'Ver' },
      { codigo: 'FACTURACION_GESTIONAR', label: 'Facturar / Reintentar' },
    ],
  },
  {
    modulo: 'PAGOS',
    label: 'Pagos',
    acciones: [
      { codigo: 'PAGOS_VER', label: 'Ver' },
      { codigo: 'PAGOS_GESTIONAR', label: 'Iniciar / Confirmar' },
    ],
  },
  {
    modulo: 'CATALOGO',
    label: 'Catálogo',
    acciones: [
      { codigo: 'CATALOGO_VER', label: 'Ver' },
      { codigo: 'CATALOGO_CREAR', label: 'Crear' },
      { codigo: 'CATALOGO_EDITAR', label: 'Editar' },
      { codigo: 'CATALOGO_ELIMINAR', label: 'Eliminar' },
    ],
  },
  {
    modulo: 'INVENTARIO',
    label: 'Inventario',
    acciones: [
      { codigo: 'INVENTARIO_VER', label: 'Ver' },
      { codigo: 'INVENTARIO_CREAR', label: 'Crear' },
      { codigo: 'INVENTARIO_EDITAR', label: 'Editar' },
      { codigo: 'INVENTARIO_ELIMINAR', label: 'Eliminar' },
    ],
  },
  {
    modulo: 'REPORTES',
    label: 'Reportes',
    acciones: [
      { codigo: 'REPORTES_VER', label: 'Ver' },
    ],
  },
];

export const TODOS_LOS_PERMISOS: string[] = MODULOS_PERMISOS.flatMap(m =>
  m.acciones.map(a => a.codigo)
);
