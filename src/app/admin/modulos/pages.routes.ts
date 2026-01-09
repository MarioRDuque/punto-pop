import { Routes } from '@angular/router';
import { Documentation } from './documentation/documentation';

export default [
    { path: 'documentation', component: Documentation },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
