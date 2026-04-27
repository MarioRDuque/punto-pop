import { Routes } from '@angular/router';
import { AppProveedor } from './proveedor/app.proveedor';
import { AppCompra } from './compra/app.compra';

export default [
  { path: 'proveedores', data: { breadcrumb: 'Proveedores' }, component: AppProveedor },
  { path: 'compras',     data: { breadcrumb: 'Compras' },     component: AppCompra },
  { path: '**', redirectTo: '/notfound' },
] as Routes;
