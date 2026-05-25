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
export class AppMenu implements OnInit {
    model: MenuItem[] = [];

    ngOnInit() {
        this.model = [
            {
                label: 'Principal',
                items: [
                    { label: 'Resumen', icon: 'pi pi-fw pi-th-large', routerLink: ['/'] }
                ]
            },
            {
                label: 'Ventas',
                items: [
                    { label: 'Nueva venta',  icon: 'pi pi-fw pi-shopping-cart', routerLink: ['/ventas/ventas'] },
                    { label: 'Clientes',     icon: 'pi pi-fw pi-users',         routerLink: ['/ventas/clientes'] }
                ]
            },
            {
                label: 'Catálogo',
                items: [
                    { label: 'Productos',           icon: 'pi pi-fw pi-box',        routerLink: ['/catalogo/productos'] },
                    { label: 'Categorías',          icon: 'pi pi-fw pi-tags',       routerLink: ['/catalogo/categorias'] },
                    { label: 'Unidades de medida',  icon: 'pi pi-fw pi-sliders-h',  routerLink: ['/catalogo/unidades-medida'] },
                    { label: 'Tarifa IVA',          icon: 'pi pi-fw pi-percentage', routerLink: ['/catalogo/tarifa-iva'] }
                ]
            },
            {
                label: 'Inventario',
                items: [
                    { label: 'Compras',     icon: 'pi pi-fw pi-truck',    routerLink: ['/inventario/compras'] },
                    { label: 'Proveedores', icon: 'pi pi-fw pi-building', routerLink: ['/inventario/proveedores'] }
                ]
            },
            {
                label: 'Facturación SRI',
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
                    { label: 'Empresa',          icon: 'pi pi-fw pi-id-card', routerLink: ['/configuracion/empresa'] },
                    { label: 'Usuarios',         icon: 'pi pi-fw pi-user',    routerLink: ['/configuracion/usuarios'] },
                    { label: 'Roles y permisos', icon: 'pi pi-fw pi-shield',  routerLink: ['/configuracion/rol'] }
                ]
            }
        ];
    }
}
