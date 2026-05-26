import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TabsModule } from 'primeng/tabs';
import { UsuarioFormulario } from './usuario-formulario/usuario-formulario';
import { UsuarioListado } from './usuario-listado/usuario-listado';
import { TabsStateService } from '../../../service/tabs.service';
import { TabsEnum } from '../../../enums/tabs-enum';
import { CargandoService } from '../../../service/cargando.service';
import { ICONSCONSTANT } from '../../../constantes/icons-constants';

@Component({
    selector: 'app-usuarios',
    standalone: true,
    imports: [
        ButtonModule,
        TooltipModule,
        TabsModule,
        UsuarioFormulario,
        UsuarioListado
    ],
    templateUrl: './app.usuarios.html'
})
export class AppUsuarios implements OnInit {

    Tabs = TabsEnum;
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
        return active === TabsEnum.CREAR || active === TabsEnum.EDITAR;
    }

    onGuardar(): void {
        this.usuarioFormulario?.guardar();
    }

    onCancelar(): void {
        this.usuarioFormulario?.irAlListado();
    }
}
