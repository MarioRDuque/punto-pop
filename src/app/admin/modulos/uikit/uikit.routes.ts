import { Routes } from '@angular/router';
import { FormLayoutDemo } from './formlayoutdemo';

export default [
    { path: 'formlayout', data: { breadcrumb: 'Form Layout' }, component: FormLayoutDemo },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
