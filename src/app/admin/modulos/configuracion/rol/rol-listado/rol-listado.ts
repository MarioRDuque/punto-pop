import { Component, inject, OnInit, signal } from '@angular/core';
import { HeaderCrud } from "../../../../component/header-crud/header-crud";
import { Grid } from "../../../../component/grid/grid";
import { RolService } from '../rol.service';
import { ToastService } from '../../../../service/toast.service';
import { CargandoService } from '../../../../service/cargando.service';
import { FormsService } from '../../../../service/forms-service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ColDef } from 'ag-grid-community';
import { RolFormulario } from '../rol-formulario/rol-formulario';
import { EventCrudBusqueda } from '../../../../enums/event-crud-busqueda';
import { ConfRol } from '../../../../entities/ConfRol';
import { AccionEnum } from '../../../../enums/accion-enum';

@Component({
  selector: 'app-rol-listado',
  imports: [HeaderCrud, Grid],
  templateUrl: './rol-listado.html',
  styleUrl: './rol-listado.scss',
  providers: [DialogService]
})
export class RolListado implements OnInit {

  private rolService = inject(RolService);
  private toast = inject(ToastService);
  private cargando = inject(CargandoService);
  public formsService = inject(FormsService);
  public dialogService = inject(DialogService);

  public listaRol = this.rolService.rol;
  public subtitulo = 'Listado de rols';
  public colDefs: ColDef[] = [];
  public ref: DynamicDialogRef<RolFormulario> | null = null;

  public exportarSignal = signal(false);
  public imprimirSignal = signal(false);

  ngOnInit(): void {
    this.rolService.cargar();
    this.colDefs = this.rolService.generarColumnasListado();
  }

  buscar(event: EventCrudBusqueda) {
    if (event.filtro) {
      this.rolService.cargar(event.filtro, undefined);
    } else {
      this.rolService.cargar(undefined, event.texto);
    }
  }

  exportarDesdeHeader() {
    this.exportarSignal.set(true);
  }

  imprimirDesdeHeader() {
    this.imprimirSignal.set(true);
  }

  consultarObj(data: ConfRol) {
    this.formsService.seleccionarObjeto(data);
    this.formsService.accion.set(AccionEnum.CONSULTAR);
    this.ref = this.dialogService.open(RolFormulario, {
      header: 'Consultar Rol',
      modal: true,
      width: '50vw',
      closable: true,
      maximizable: true,
      contentStyle: { overflow: 'auto' }
    });
  }

  cambiarEstados(event: { data: ConfRol; estado: boolean }) {
    this.cargando.activar();
    if (event.data) {
      event.data.rolEstado = event.estado;
      this.rolService.actualizar(event.data)
        .subscribe({
          next: (estado) => this.despuesDeCambiarEstado(estado),
        });
    }
  }

  despuesDeCambiarEstado(estado: ConfRol) {
    this.toast.success("El rol " + estado.rolCodigo + " ha sido ➔ " + (estado.rolEstado ? "ACTIVADO" : "INACTIVADO"));
    this.rolService.actualizarElGrid(estado);
    this.cargando.inactivar();
  }

  eliminarObj(data: ConfRol) {
    this.cargando.activar();
    if (data) {
      this.rolService.eliminar(data)
        .subscribe({
          next: () => this.despuesDeEliminar(data),
        });
    }
  }

  despuesDeEliminar(data: ConfRol) {
    this.toast.success("El rol ha sido eliminado.");
    this.rolService.eliminarDelGrid(data);
    this.cargando.inactivar();
  }

}
