import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
import { TabsStateService } from '../../../../service/tabs.service';
import { TabsEnum } from '../../../../enums/tabs-enum';

@Component({
  selector: 'app-rol-listado',
  imports: [HeaderCrud, Grid],
  templateUrl: './rol-listado.html',
  styleUrl: './rol-listado.scss',
  providers: [DialogService]
})
export class RolListado implements OnInit {

  private readonly rolService = inject(RolService);
  private readonly toast = inject(ToastService);
  private readonly cargando = inject(CargandoService);
  private readonly formsService = inject(FormsService);
  private readonly tabsState = inject(TabsStateService);
  private readonly destroyRef = inject(DestroyRef);
  public readonly dialogService = inject(DialogService);

  public listaRol = this.rolService.listaRoles;
  public subtitulo = 'Listado de rols';
  public colDefs: ColDef[] = [];
  public ref: DynamicDialogRef<RolFormulario> | null = null;

  public exportarSignal = signal(false);
  public imprimirSignal = signal(false);

  ngOnInit(): void {
    this.rolService.cargar().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    this.colDefs = this.rolService.generarColumnasListado();
  }

  buscar(event: EventCrudBusqueda): void {
    if (event.filtro) {
      this.rolService.cargar(event.filtro, undefined).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    } else {
      this.rolService.cargar(undefined, event.texto).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    }
  }

  exportarDesdeHeader() {
    this.exportarSignal.set(true);
  }

  imprimirDesdeHeader() {
    this.imprimirSignal.set(true);
  }

  editarObj(data: ConfRol) {
    this.formsService.seleccionarObjeto(data);
    this.formsService.accion.set(AccionEnum.EDITAR);
    this.tabsState.cambiarEstadoTab(false);
    this.tabsState.irATab(TabsEnum.EDITAR);
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
