import { Component, inject } from '@angular/core';
import { FluidModule } from 'primeng/fluid';
import { PanelModule } from 'primeng/panel';
import { TabsModule } from 'primeng/tabs';
import { UsuarioFormulario } from "./usuario-formulario/usuario-formulario";
import { UsuarioListado } from "./usuario-listado/usuario-listado";
import { TabsStateService } from '../../../service/tabs.service';
import { TabsEnum } from '../../../enums/tabs-enum';
import { FormsService } from '../../../service/forms-service';
import { AccionEnum } from '../../../enums/accion-enum';
import { ICONSCONSTANT } from '../../../constantes/icons-constants';

@Component({
    selector: 'app-usuarios',
    standalone: true,
    imports: [
        FluidModule,
        PanelModule,
        TabsModule,
        UsuarioFormulario,
        UsuarioListado
    ],
    templateUrl: './app.usuarios.html'
})
export class AppUsuarios {

    Tabs = TabsEnum;
    tabsState = inject(TabsStateService);
    formsService = inject(FormsService);
    ICONSCONSTANT = ICONSCONSTANT;

    onTabChange(value: string | number | undefined) {
        this.tabsState.irATab(value ?? TabsEnum.LISTADO);
        if (value == this.Tabs.CREAR) {
            this.formsService.accion.set(AccionEnum.CREAR);
        }
        this.tabsState.cambiarEstadoTab(true);
    }
}


