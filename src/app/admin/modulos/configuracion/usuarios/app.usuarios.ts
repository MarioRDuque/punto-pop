import { Component, inject, OnInit } from '@angular/core';
import { FluidModule } from 'primeng/fluid';
import { PanelModule } from 'primeng/panel';
import { TabsModule } from 'primeng/tabs';
import { UsuarioFormulario } from "./usuario-formulario/usuario-formulario";
import { UsuarioListado } from "./usuario-listado/usuario-listado";
import { TabsStateService } from '../../../service/tabs.service';
import { TabsEnum } from '../../../enums/tabs-enum';

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
export class AppUsuarios implements OnInit {
    
    Tabs = TabsEnum;
    tabsState = inject(TabsStateService);

    ngOnInit(): void {
        this.onTabChange(TabsEnum.LISTADO);
    }

    onTabChange(value: string | number | undefined) {
        this.tabsState.irATab(value ?? '0');
        this.tabsState.cambiarEstadoTab(true);
    }
}


