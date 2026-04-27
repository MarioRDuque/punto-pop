import { Routes } from '@angular/router';
import { AppLayout } from './admin/component/layout/app.layout';
import { Perfil } from './admin/modulos/configuracion/perfil/perfil';
import { Landing } from './admin/modulos/landing/landing';
import { Notfound } from './admin/modulos/notfound/notfound';
import { Documentation } from './admin/modulos/documentation/documentation';
import { authGuard } from './admin/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        component: AppLayout,
        canActivate: [authGuard],
        children: [
            { path: '', component: Perfil },
            { path: 'configuracion', loadChildren: () => import('./admin/modulos/configuracion/configuracion.routes') },
            { path: 'catalogo', loadChildren: () => import('./admin/modulos/catalogo/catalogo.routes') },
            { path: 'ventas', loadChildren: () => import('./admin/modulos/ventas/ventas.routes') },
            { path: 'inventario', loadChildren: () => import('./admin/modulos/inventario/inventario.routes') },
            { path: 'facturacion', loadChildren: () => import('./admin/modulos/facturacion/facturacion.routes') },
            { path: 'reportes', loadChildren: () => import('./admin/modulos/reportes/reportes.routes') },
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
