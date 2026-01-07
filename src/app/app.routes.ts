import { Routes } from '@angular/router';
import { AppLayout } from './admin/component/layout/app.layout';
import { Dashboard } from './admin/modulos/dashboard/dashboard';
import { Landing } from './admin/modulos/landing/landing';
import { Notfound } from './admin/modulos/notfound/notfound';
import { Documentation } from './admin/modulos/documentation/documentation';

export const routes: Routes = [
    {
        path: '',
        component: AppLayout,
        children: [
            { path: '', component: Dashboard },
            { path: 'uikit', loadChildren: () => import('./admin/modulos/uikit/uikit.routes') },
            { path: 'documentation', component: Documentation },
            { path: 'pages', loadChildren: () => import('./admin/modulos/pages.routes') }
        ]
    },
    { path: 'landing', component: Landing },
    { path: 'notfound', component: Notfound },
    { path: 'auth', loadChildren: () => import('./admin/modulos/auth/auth.routes') },
    { path: '**', redirectTo: '/notfound' }
];
