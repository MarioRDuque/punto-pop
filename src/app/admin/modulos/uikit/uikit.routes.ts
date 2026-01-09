import { Routes } from '@angular/router';
import { FormLayoutDemo } from './formlayoutdemo';
import { AppUsuarios } from '../configuracion/usuarios/app.usuarios';

export default [
    { path: 'formlayout', data: { breadcrumb: 'Form Layout' }, component: FormLayoutDemo },
    { path: 'usuarios', data: { breadcrumb: 'Usuario' }, component:  AppUsuarios},
    { path: '**', redirectTo: '/notfound' }
] as Routes;
