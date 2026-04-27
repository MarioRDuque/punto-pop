import { Routes } from '@angular/router';
import { AppCategoria } from './categoria/app.categoria';
import { AppUnidadMedida } from './unidad-medida/app.unidad-medida';
import { AppProducto } from './producto/app.producto';

export default [
  { path: 'categorias', data: { breadcrumb: 'Categorías' }, component: AppCategoria },
  { path: 'unidades-medida', data: { breadcrumb: 'Unidades de Medida' }, component: AppUnidadMedida },
  { path: 'productos', data: { breadcrumb: 'Productos' }, component: AppProducto },
  { path: '**', redirectTo: '/notfound' }
] as Routes;
