import { Component, inject, OnInit } from '@angular/core';
import type { ColDef } from "ag-grid-community";
import { HeaderCrud } from "../../../../component/header-crud/header-crud";
import { Grid } from "../../../../component/grid/grid";
import { UsuariosService } from '../usuarios.service';
import { Fieldset } from "primeng/fieldset";
import { InputComponent } from "../../../../component/input/input.component";
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from "primeng/button";
import { TooltipModule } from 'primeng/tooltip';
import { FormsData } from '../../../../service/forms-data';

@Component({
  selector: 'app-usuario-listado',
  imports: [
    HeaderCrud,
    Grid,
    Fieldset,
    InputComponent,
    ReactiveFormsModule,
    ButtonModule,
    TooltipModule
  ],
  templateUrl: './usuario-listado.html',
  styleUrl: './usuario-listado.scss',
})
export class UsuarioListado implements OnInit {

  private usuariosService = inject(UsuariosService);
  private fb = inject(FormBuilder);
  tabsState = inject(FormsData);

  public listaUsuarios = this.usuariosService.usuarios;
  public subtitulo = 'Listado usuarios';
  public filtrarUsuario = this.fb.group({
    usuApellidos: [''],
    usuNombre: ['']
  });

  ngOnInit(): void {
    this.usuariosService.cargar();
  }

  buscar(event?:string) {
    console.log(event);
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
