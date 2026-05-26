import { Component, computed, inject, signal, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { LayoutService } from '../../service/layout.service';
import { AuthService } from '../../service/auth.service';
import { TabsStateService } from '../../service/tabs.service';
import { filter, Subscription } from 'rxjs';

interface Breadcrumb {
    section: string;
    page: string;
}

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule],
    templateUrl: './app.topbar.html'
})
export class AppTopbar implements OnInit, OnDestroy {
    items!: MenuItem[];
    public layoutService = inject(LayoutService);
    public authService = inject(AuthService);
    private router = inject(Router);
    private tabsStateService = inject(TabsStateService);

    @ViewChild('searchInput') searchInputRef!: ElementRef<HTMLInputElement>;

    public fotoUsuario = computed(() => this.authService.usuario()?.foto ?? null);

    public iniciales = computed(() => {
        const u = this.authService.usuario();
        if (!u) return '?';
        const nombre = (u.nombre ?? '').trim().charAt(0).toUpperCase();
        const apellido = (u.apellidos ?? '').trim().charAt(0).toUpperCase();
        return nombre + (apellido || '');
    });

    public nombreCompleto = computed(() => {
        const u = this.authService.usuario();
        if (!u) return '';
        return [u.nombre, u.apellidos].filter(Boolean).join(' ');
    });

    public currentTime = signal<string>('');
    public isDarkTheme = computed(() => this.layoutService.isDarkTheme());

    // URL actual como signal para que breadcrumb sea reactive
    private currentUrl = signal<string>('');

    private routerSub!: Subscription;
    private clockInterval!: ReturnType<typeof setInterval>;

    private readonly sectionMap: Record<string, string> = {
        'ventas/ventas': 'Ventas',
        'ventas/clientes': 'Clientes',
        'catalogo/productos': 'Productos',
        'catalogo/categorias': 'Categorías',
        'catalogo/unidades-medida': 'Unidades de medida',
        'inventario/compras': 'Compras',
        'inventario/proveedores': 'Proveedores',
        'configuracion/usuarios': 'Usuarios',
        'configuracion/rol': 'Roles',
        'facturacion/comprobantes': 'Comprobantes',
        reportes: 'Reportes',
        uikit: 'UI Kit',
    };

    // Etiquetas por ruta + tab activo
    private readonly moduleTabLabels: Record<string, Record<string, string>> = {
        'ventas/ventas': {
            listado: 'Listado de ventas',
            crear: 'Nueva venta',
            editar: 'Ver venta',
        },
        'ventas/clientes': {
            listado: 'Lista de clientes',
            crear: 'Crear cliente',
            editar: 'Editar cliente',
        },
        'catalogo/productos': {
            listado: 'Productos',
            crear: 'Crear producto',
            editar: 'Editar producto',
        },
        'catalogo/categorias': {
            listado: 'Categorías',
            crear: 'Crear categoría',
            editar: 'Editar categoría',
        },
        'catalogo/unidades-medida': {
            listado: 'Unidades de medida',
            crear: 'Nueva unidad',
            editar: 'Editar unidad',
        },
        'inventario/compras': {
            listado: 'Compras',
            crear: 'Nueva compra',
            editar: 'Editar compra',
        },
        'inventario/proveedores': {
            listado: 'Proveedores',
            crear: 'Nuevo proveedor',
            editar: 'Editar proveedor',
        },
        'configuracion/usuarios': {
            listado: 'Usuarios',
            crear: 'Crear usuario',
            editar: 'Editar usuario',
        },
        'configuracion/rol': {
            listado: 'Roles',
            crear: 'Crear rol',
            editar: 'Editar rol',
        },
        'facturacion/comprobantes': {
            listado: 'Comprobantes',
            crear: 'Nuevo comprobante',
            editar: 'Ver comprobante',
        },
    };

    // Fallback para rutas sin tabs
    private readonly pageMap: Record<string, string> = {
        reportes: 'Reportes',
    };

    // Breadcrumb completamente reactivo: URL + tab activo
    public breadcrumb = computed<Breadcrumb>(() => {
        const url = this.currentUrl();
        const tab = this.tabsStateService.tabActivo();
        const segments = url.split('/').filter(Boolean);
        if (!segments.length) return { section: '', page: '' };

        const routeKey = segments.slice(0, 2).join('/');
        const section = this.sectionMap[routeKey] ?? this.sectionMap[segments[0]] ?? '';
        const tabLabels = this.moduleTabLabels[routeKey];
        const page = tabLabels?.[tab] ?? this.pageMap[segments[1]] ?? '';
        return { section, page };
    });

    // ⌘K / Ctrl+K → foca el buscador
    @HostListener('document:keydown', ['$event'])
    onKeydown(event: KeyboardEvent) {
        if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
            event.preventDefault();
            this.searchInputRef?.nativeElement?.focus();
        }
    }

    ngOnInit() {
        this.updateTime();
        this.clockInterval = setInterval(() => this.updateTime(), 60000);

        // Inicializar con URL actual
        this.currentUrl.set(this.router.url);

        this.routerSub = this.router.events
            .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
            .subscribe((e) => {
                // Reset el tab a LISTADO en cada navegación entre rutas
                this.tabsStateService.reset();
                this.currentUrl.set(e.urlAfterRedirects);
            });
    }

    ngOnDestroy() {
        this.routerSub?.unsubscribe();
        clearInterval(this.clockInterval);
    }

    private updateTime() {
        const now = new Date();
        const days = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
        const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
        const day = days[now.getDay()];
        const date = now.getDate();
        const month = months[now.getMonth()];
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        this.currentTime.set(`${day} ${date} ${month}  ${hours}:${minutes}`);
    }

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }

    cerrarSesion() {
        this.authService.logout();
        this.router.navigate(['/auth/login']);
    }
}
