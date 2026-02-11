import { Routes } from '@angular/router';
import { AppUsuarios } from './usuarios/app.usuarios';
import { AppRol } from './rol/app.rol';

export default [
    { path: 'usuarios', data: { breadcrumb: 'Usuario' }, component: AppUsuarios },
    { path: 'rol', data: { breadcrumb: 'Rol' }, component: AppRol },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
