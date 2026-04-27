import { Routes } from '@angular/router';
import { AppReporte } from './reporte/app.reporte';

export default [
  { path: '', data: { breadcrumb: 'Reportes' }, component: AppReporte },
  { path: '**', redirectTo: '/notfound' }
] as Routes;
