import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FieldsetModule } from 'primeng/fieldset';
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
    FieldsetModule,
    ReactiveFormsModule,
    TabsModule,
    UsuarioFormulario,
    UsuarioListado
],
    templateUrl: './app.usuarios.html'
})
export class AppUsuarios implements OnInit {

    ngOnInit() {

    }

}


