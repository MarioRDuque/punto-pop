import { Routes } from '@angular/router';
import { AppCliente } from './cliente/app.cliente';
import { AppVenta } from './venta/app.venta';

export default [
  { path: 'clientes', data: { breadcrumb: 'Clientes' }, component: AppCliente },
  { path: 'ventas', data: { breadcrumb: 'Ventas' }, component: AppVenta },
  { path: '**', redirectTo: '/notfound' }
] as Routes;
