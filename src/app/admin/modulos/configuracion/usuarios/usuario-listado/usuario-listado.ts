import { Component, inject, OnInit, signal } from '@angular/core';
import { HeaderCrud } from "../../../../component/header-crud/header-crud";
import { Grid } from "../../../../component/grid/grid";
import { UsuariosService } from '../usuarios.service';
import { ColDef } from 'ag-grid-enterprise';

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

  buscar(event?: string) {
    console.log(event);
    this.usuariosService.cargar();
  }

  exportarDesdeHeader() {
    this.exportarSignal.update(v => v + 1);
  }

}
