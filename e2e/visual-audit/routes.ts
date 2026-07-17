/**
 * Inventario de rutas de negocio, extraído de los `*.routes.ts` reales de cada módulo
 * (no asumido) al momento de escribir este audit. Si el árbol de rutas cambia, actualizar
 * acá — no hay descubrimiento automático porque las rutas de detalle/edición dependen de
 * IDs que solo existen en runtime (se abren como diálogos desde el grid, no como rutas).
 */
export interface AuditRoute {
  module: string;
  name: string;
  path: string;
}

export const auditRoutes: AuditRoute[] = [
  { module: 'home', name: 'perfil', path: '/' },
  { module: 'configuracion', name: 'usuarios', path: '/configuracion/usuarios' },
  { module: 'configuracion', name: 'rol', path: '/configuracion/rol' },
  { module: 'catalogo', name: 'categorias', path: '/catalogo/categorias' },
  { module: 'catalogo', name: 'unidades-medida', path: '/catalogo/unidades-medida' },
  { module: 'catalogo', name: 'productos', path: '/catalogo/productos' },
  { module: 'ventas', name: 'clientes', path: '/ventas/clientes' },
  { module: 'ventas', name: 'ventas', path: '/ventas/ventas' },
  { module: 'inventario', name: 'proveedores', path: '/inventario/proveedores' },
  { module: 'inventario', name: 'compras', path: '/inventario/compras' },
  { module: 'facturacion', name: 'comprobantes', path: '/facturacion/comprobantes' },
  { module: 'reportes', name: 'reporte', path: '/reportes' },
  { module: 'pages', name: 'documentation', path: '/pages/documentation' },
];
