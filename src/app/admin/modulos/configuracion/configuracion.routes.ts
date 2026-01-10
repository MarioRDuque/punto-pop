import { Routes } from '@angular/router';
import { AppUsuarios } from './usuarios/app.usuarios';

export default [
    { path: 'usuarios', data: { breadcrumb: 'Usuario' }, component: AppUsuarios },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
