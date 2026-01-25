import { Component, inject, OnInit } from '@angular/core';
import type { ColDef } from "ag-grid-community";
import { HeaderCrud } from "../../../../component/header-crud/header-crud";
import { Grid } from "../../../../component/grid/grid";
import { UsuariosService } from '../usuarios.service';
import { CargandoService } from '../../../../service/cargando.service';
import { ConfUsuario } from '../../../../entities/ConfUsuario';

@Component({
  selector: 'app-usuario-listado',
  imports: [HeaderCrud, Grid],
  templateUrl: './usuario-listado.html',
  styleUrl: './usuario-listado.scss',
})
export class UsuarioListado implements OnInit {

  private usuariosService = inject(UsuariosService);
  private cargando = inject(CargandoService);
  public listaUsuarios: ConfUsuario[] = [];
  public subtitulo = 'Listado usuarios';

  ngOnInit(): void {
    this.listarUsuario();
  }

  listarUsuario() {
    this.cargando.activar();
    this.usuariosService.listarUsuarios()
      .subscribe({
        next: (data) => this.despuesDeListarUsuarios(data)
      });
  }

  despuesDeListarUsuarios(data: ConfUsuario[]) {
    // lo que necesites hacer con la data
    this.listaUsuarios = data;
    this.cargando.inactivar();
  }

  colDefs: ColDef[] = [
    {
      headerName: "Usuario",
      field: "usuUsername"
    },
    {
      headerName: "Nombre",
      field: "usuNombre"
    },
    {
      headerName: "Apellidos",
      field: "usuApellidos"
    },
    {
      headerName: "E-mail",
      field: "usuEmail"
    },
    {
      headerName: "Teléfono",
      field: "usuTelefono"
    },
    {
      headerName: "Dirección",
      field: "usuDireccion"
    },
    {
      headerName: "Estado",
      field: "usuEstado",
      cellRenderer: 'agCheckboxCellRenderer',
      cellRendererParams: {
        disabled: true
      },
      width: 100,
      cellStyle: {
        textAlign: 'center'
      }
    }
  ];

}
