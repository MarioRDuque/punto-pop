import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { UsuarioFormulario } from './usuario-formulario/usuario-formulario';
import { UsuarioListado } from './usuario-listado/usuario-listado';
import { TabsStateService } from '../../../service/tabs.service';
import { CargandoService } from '../../../service/cargando.service';
import { ICONSCONSTANT } from '../../../constantes/icons-constants';
import { TabsCard } from '../../../component/tabs-card/tabs-card';

@Component({
    selector: 'app-usuarios',
    standalone: true,
    imports: [
        TabsCard,
        UsuarioFormulario,
        UsuarioListado
    ],
    templateUrl: './app.usuarios.html'
})
export class AppUsuarios implements OnInit {

    tabsState = inject(TabsStateService);
    cargando = inject(CargandoService);
    ICONSCONSTANT = ICONSCONSTANT;

    @ViewChild(UsuarioFormulario) usuarioFormulario?: UsuarioFormulario;

    ngOnInit(): void {
        this.tabsState.onInit();
    }

    onTabChange(value: string | number | undefined) {
        this.tabsState.onTabChange(value);
    }

    get showFormActions(): boolean {
        const active = this.tabsState.tabActivo();
        return active === 'crear' || active === 'editar';
    }

    onGuardar(): void {
        this.usuarioFormulario?.guardar();
    }

    onCancelar(): void {
        this.usuarioFormulario?.irAlListado();
    }
}
