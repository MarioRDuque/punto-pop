import { Component, OnInit } from '@angular/core';

import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from '../menuitem/app.menuitem';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [AppMenuitem, RouterModule],
    templateUrl: './app.menu.html'
})
export class AppMenu implements OnInit{
    model: MenuItem[] = [];

    ngOnInit() {
        this.model = [
            {
                label: 'Principal',
                items: [{ label: 'Perfil', icon: 'pi pi-fw pi-home', routerLink: ['/'] }]
            },
            {
                label: 'Ventas',
                items: [
                    { label: 'Nueva Venta', icon: 'pi pi-fw pi-shopping-cart', routerLink: ['/ventas/ventas'] },
                    { label: 'Clientes', icon: 'pi pi-fw pi-users', routerLink: ['/ventas/clientes'] }
                ]
            },
            {
                label: 'Catálogo',
                items: [
                    { label: 'Productos', icon: 'pi pi-fw pi-box', routerLink: ['/catalogo/productos'] },
                    { label: 'Categorías', icon: 'pi pi-fw pi-tags', routerLink: ['/catalogo/categorias'] },
                    { label: 'Unidades de Medida', icon: 'pi pi-fw pi-calculator', routerLink: ['/catalogo/unidades-medida'] }
                ]
            },
            {
                label: 'Inventario',
                items: [
                    { label: 'Compras', icon: 'pi pi-fw pi-truck', routerLink: ['/inventario/compras'] },
                    { label: 'Proveedores', icon: 'pi pi-fw pi-building', routerLink: ['/inventario/proveedores'] }
                ]
            },
            {
                label: 'Facturación',
                items: [
                    { label: 'Comprobantes', icon: 'pi pi-fw pi-file-check', routerLink: ['/facturacion/comprobantes'] }
                ]
            },
            {
                label: 'Reportes',
                items: [
                    { label: 'Reportes', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/reportes'] }
                ]
            },
            {
                label: 'Configuración',
                items: [
                    { label: 'Usuarios', icon: 'pi pi-fw pi-user', routerLink: ['/configuracion/usuarios'] },
                    { label: 'Roles', icon: 'pi pi-fw pi-shield', routerLink: ['/configuracion/rol'] }
                ]
            }
        ];
    }
}
