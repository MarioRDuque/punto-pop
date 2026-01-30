import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { HeaderCrud } from "../../../../component/header-crud/header-crud";
import { Grid } from "../../../../component/grid/grid";
import { UsuariosService } from '../usuarios.service';
import { FormsData } from '../../../../service/forms-data';
import { ColDef } from 'ag-grid-enterprise';
import { ConfUsuario } from '../../../../entities/ConfUsuario';

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
  public tabsState = inject(FormsData);

  @ViewChild('gridUsuarios') grid!: Grid<ConfUsuario>;

  public listaUsuarios = this.usuariosService.usuarios;
  public subtitulo = 'Listado usuarios';

  ngOnInit(): void {
    this.usuariosService.cargar();
  }

  buscar(event?: string) {
    console.log(event);
    this.usuariosService.cargar();
  }

  exportarDesdeHeader() {
    this.grid.exportarExcel();
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
