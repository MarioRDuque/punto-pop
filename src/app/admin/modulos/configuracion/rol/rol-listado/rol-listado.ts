import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Grid } from '../../../../component/grid/grid';
import { ListadoToolbar, ToolbarTab } from '../../../../component/listado-toolbar/listado-toolbar';
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

type FilterType = 'todos' | 'activos' | 'inactivos';

@Component({
  selector: 'app-rol-listado',
  imports: [CommonModule, FormsModule, Grid, ListadoToolbar],
  templateUrl: './rol-listado.html',
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

  readonly searchQuery = signal('');
  readonly activeFilter = signal<FilterType>('todos');

  readonly counts = computed(() => {
    const list = this.listaRol();
    return {
      todos: list.length,
      activos: list.filter(r => r.rolEstado).length,
      inactivos: list.filter(r => !r.rolEstado).length,
    };
  });

  readonly tabs = computed<ToolbarTab[]>(() => [
    { key: 'todos',     label: 'Todos',     count: this.counts().todos },
    { key: 'activos',   label: 'Activos',   count: this.counts().activos },
    { key: 'inactivos', label: 'Inactivos', count: this.counts().inactivos },
  ]);

  readonly filteredRoles = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const tab = this.activeFilter();
    return this.listaRol().filter(r => {
      const matchTab = tab === 'todos' ? true : tab === 'activos' ? r.rolEstado : !r.rolEstado;
      if (!matchTab) return false;
      if (!q) return true;
      return r.rolCodigo?.toLowerCase().includes(q) || r.rolDescripcion?.toLowerCase().includes(q);
    });
  });

  ngOnInit(): void {
    this.rolService.cargar().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    this.colDefs = this.rolService.generarColumnasListado();
  }

  setFilter(tab: FilterType) { this.activeFilter.set(tab); }
  onSearch(q: string) { this.searchQuery.set(q); }

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
