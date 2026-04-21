import { Component, computed, inject } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { AppConfigurator } from '../configurator/app.configurator';
import { LayoutService } from '../../service/layout.service';
import { AuthService } from '../../service/auth.service';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, AppConfigurator],
    templateUrl: './app.topbar.html'
})
export class AppTopbar {
    items!: MenuItem[];
    public layoutService = inject(LayoutService);
    public authService = inject(AuthService);
    private router = inject(Router);

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

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }

    cerrarSesion() {
        this.authService.logout();
        this.router.navigate(['/auth/login']);
    }
}
