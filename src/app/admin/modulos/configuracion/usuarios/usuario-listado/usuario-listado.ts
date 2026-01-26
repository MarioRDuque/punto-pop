import { Component, inject, OnInit } from '@angular/core';
import type { ColDef } from "ag-grid-community";
import { HeaderCrud } from "../../../../component/header-crud/header-crud";
import { Grid } from "../../../../component/grid/grid";
import { UsuariosService } from '../usuarios.service';

@Component({
  selector: 'app-usuario-listado',
  imports: [HeaderCrud, Grid],
  templateUrl: './usuario-listado.html',
  styleUrl: './usuario-listado.scss',
})
export class UsuarioListado implements OnInit {

  private usuariosService = inject(UsuariosService);
  public listaUsuarios = this.usuariosService.usuarios;
  public subtitulo = 'Listado usuarios';

  ngOnInit(): void {
    this.usuariosService.cargar();
  }

  colDefs: ColDef[] = [
    {
      headerName: "Usuario",
      field: "usuUsername",
      width: 120,
      minWidth: 120
    },
    {
      headerName: "Nombre",
      field: "usuNombre",
      width: 120,
      minWidth: 120
    },
    {
      headerName: "Apellidos",
      field: "usuApellidos",
      width: 250,
      minWidth: 250
    },
    {
      headerName: "E-mail",
      field: "usuEmail",
      width: 200,
      minWidth: 200
    },
    {
      headerName: "Teléfono",
      field: "usuTelefono",
      width: 100,
      minWidth: 100
    },
    {
      headerName: "Dirección",
      field: "usuDireccion",
      width: 250,
      minWidth: 250
    },
    {
      headerName: "Estado",
      field: "usuEstado",
      cellRenderer: 'agCheckboxCellRenderer',
      cellRendererParams: {
        disabled: true
      },
      width: 100,
      minWidth: 100,
      maxWidth: 100,
      cellStyle: {
        textAlign: 'center'
      }
    }
  ];

}
