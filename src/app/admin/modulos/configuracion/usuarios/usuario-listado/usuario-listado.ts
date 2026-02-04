import { Component, inject, OnInit, signal } from '@angular/core';
import { HeaderCrud } from "../../../../component/header-crud/header-crud";
import { Grid } from "../../../../component/grid/grid";
import { UsuariosService } from '../usuarios.service';
import { ColDef } from 'ag-grid-enterprise';
import { EventCrudBusqueda } from '../../../../enums/event-crud-busqueda';
import { ConfUsuario } from '../../../../entities/ConfUsuario';
import { ToastService } from '../../../../service/toast.service';
import { CargandoService } from '../../../../service/cargando.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { UsuarioFormulario } from '../usuario-formulario/usuario-formulario';
import { FormsService } from '../../../../service/forms-service';
import { AccionEnum } from '../../../../enums/accion-enum';

@Component({
  selector: 'app-usuario-listado',
  imports: [
    HeaderCrud,
    Grid
  ],
  templateUrl: './usuario-listado.html',
  styleUrl: './usuario-listado.scss',
  providers: [DialogService]
})
export class UsuarioListado implements OnInit {

  private usuariosService = inject(UsuariosService);
  private toast = inject(ToastService);
  private cargando = inject(CargandoService);
  public formsService = inject(FormsService);
  public dialogService = inject(DialogService);

  public listaUsuarios = this.usuariosService.usuarios;
  public subtitulo = 'Listado de usuarios';
  public colDefs: ColDef[] = [];
  public ref: DynamicDialogRef<UsuarioFormulario> | null = null;

  public exportarSignal = signal(false);
  public imprimirSignal = signal(false);

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
    this.exportarSignal.set(true);
  }

  imprimirDesdeHeader() {
    this.imprimirSignal.set(true);
  }

  consultarObj(data: ConfUsuario) {
    this.formsService.seleccionarObjeto(data);
    this.formsService.accion.set(AccionEnum.CONSULTAR);
    this.ref = this.dialogService.open(UsuarioFormulario, {
      header: 'Consultar Usuario',
      modal: true,
      width: '50vw',
      closable: true,
      maximizable: true,
      contentStyle: { overflow: 'auto' }
    });
  }

  cambiarEstados(event: { data: ConfUsuario; estado: boolean }) {
    this.cargando.activar();
    if (event.data) {
      event.data.usuEstado = event.estado;
      this.usuariosService.actualizar(event.data)
        .subscribe({
          next: (estado) => this.despuesDeCambiarEstado(estado),
        });
    }
  }

  despuesDeCambiarEstado(estado: ConfUsuario) {
    this.toast.success("El usuario " + estado.usuUsername + " ha sido ➔ " + (estado.usuEstado ? "ACTIVADO" : "INACTIVADO"));
    this.usuariosService.actualizarElGrid(estado);
    this.cargando.inactivar();
  }

  eliminarObj(data: ConfUsuario) {
    this.cargando.activar();
    if (data) {
      this.usuariosService.eliminar(data)
        .subscribe({
          next: () => this.despuesDeEliminar(data),
        });
    }
  }

  despuesDeEliminar(data: ConfUsuario) {
    this.toast.success("El usuario ha sido eliminado.");
    this.usuariosService.eliminarDelGrid(data);
    this.cargando.inactivar();
  }

}
