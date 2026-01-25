import { Component } from '@angular/core';
import { FluidModule } from 'primeng/fluid';
import { PanelModule } from 'primeng/panel';
import { TabsModule } from 'primeng/tabs';
import { UsuarioFormulario } from "./usuario-formulario/usuario-formulario";
import { UsuarioListado } from "./usuario-listado/usuario-listado";

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

}


