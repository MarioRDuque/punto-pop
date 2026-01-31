import { Component, inject, OnInit, signal } from '@angular/core';
import { HeaderCrud } from "../../../../component/header-crud/header-crud";
import { Grid } from "../../../../component/grid/grid";
import { UsuariosService } from '../usuarios.service';
import { ColDef } from 'ag-grid-enterprise';
import { EventCrudBusqueda } from '../../../../enums/event-crud-busqueda';

@Component({
  selector: 'app-usuario-listado',
  imports: [
    HeaderCrud,
    Grid
  ],
  templateUrl: './usuario-listado.html',
  styleUrl: './usuario-listado.scss',
})
export class UsuarioListado implements OnInit {

  private usuariosService = inject(UsuariosService);

  public listaUsuarios = this.usuariosService.usuarios;
  public subtitulo = 'Listado usuarios';
  public colDefs: ColDef[] = [];

  public exportarSignal = signal(0);

  ngOnInit(): void {
    this.usuariosService.cargar();
    this.colDefs = this.usuariosService.generarColumnasListado();
  }

  buscar(event: EventCrudBusqueda) {
    if (event.filtro) {
      this.usuariosService.cargar(event.filtro, undefined);
    } else {
      this.usuariosService.cargar(undefined, event.texto);
    }
  }

  exportarDesdeHeader() {
    this.exportarSignal.update(v => v + 1);
  }

}
