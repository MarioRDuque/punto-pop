import { Routes } from '@angular/router';
import { AppComprobante } from './comprobante/app.comprobante';

export default [
  { path: 'comprobantes', data: { breadcrumb: 'Comprobantes' }, component: AppComprobante },
  { path: '**', redirectTo: '/notfound' }
] as Routes;
