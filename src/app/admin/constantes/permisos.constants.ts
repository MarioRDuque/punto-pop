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
      { codigo: 'VENTAS_ANULAR', label: 'Anular' },
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
  {
    modulo: 'CONFIGURACION',
    label: 'Configuración',
    acciones: [
      { codigo: 'CONFIGURACION_VER', label: 'Ver' },
      { codigo: 'CONFIGURACION_CREAR', label: 'Crear' },
      { codigo: 'CONFIGURACION_EDITAR', label: 'Editar' },
      { codigo: 'CONFIGURACION_ELIMINAR', label: 'Eliminar' },
    ],
  },
];

export const TODOS_LOS_PERMISOS: string[] = MODULOS_PERMISOS.flatMap(m =>
  m.acciones.map(a => a.codigo)
);
