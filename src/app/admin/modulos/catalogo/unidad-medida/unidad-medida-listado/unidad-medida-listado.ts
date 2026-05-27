import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ColDef } from 'ag-grid-community';
import { Grid } from '../../../../component/grid/grid';
import { ListadoToolbar, ToolbarTab } from '../../../../component/listado-toolbar/listado-toolbar';
import { UnidadMedidaService } from '../unidad-medida.service';
import { UnidadMedidaFormulario } from '../unidad-medida-formulario/unidad-medida-formulario';
import { ToastService } from '../../../../service/toast.service';
import { CargandoService } from '../../../../service/cargando.service';
import { FormsService } from '../../../../service/forms-service';
import { TabsStateService } from '../../../../service/tabs.service';
import { CatUnidadMedida } from '../../../../entities/CatUnidadMedida';
import { AccionEnum } from '../../../../enums/accion-enum';
import { TabsEnum } from '../../../../enums/tabs-enum';
import { EventCrudBusqueda } from '../../../../enums/event-crud-busqueda';

type FilterType = 'todos' | 'activos' | 'inactivos';

@Component({
  selector: 'app-unidad-medida-listado',
  standalone: true,
  imports: [CommonModule, FormsModule, Grid, ListadoToolbar],
  templateUrl: './unidad-medida-listado.html',
  providers: [DialogService]
})
export class UnidadMedidaListado implements OnInit {

  private unidadMedidaService = inject(UnidadMedidaService);
  private toast = inject(ToastService);
  private cargando = inject(CargandoService);
  private formsService = inject(FormsService) as FormsService<CatUnidadMedida>;
  private tabsState = inject(TabsStateService);
  private destroyRef = inject(DestroyRef);
  public dialogService = inject(DialogService);

  public listaUnidades = this.unidadMedidaService.listaUnidades;
  public subtitulo = 'Listado de unidades de medida';
  public colDefs: ColDef[] = [];
  public ref: DynamicDialogRef<UnidadMedidaFormulario> | null = null;

  public exportarSignal = signal(false);
  public imprimirSignal = signal(false);

  readonly searchQuery = signal('');
  readonly activeFilter = signal<FilterType>('todos');

  readonly counts = computed(() => {
    const list = this.listaUnidades();
    return {
      todos: list.length,
      activos: list.filter(u => u.estado).length,
      inactivos: list.filter(u => !u.estado).length,
    };
  });

  readonly tabs = computed<ToolbarTab[]>(() => [
    { key: 'todos',     label: 'Todos',     count: this.counts().todos },
    { key: 'activos',   label: 'Activos',   count: this.counts().activos },
    { key: 'inactivos', label: 'Inactivos', count: this.counts().inactivos },
  ]);

  readonly filteredUnidades = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const tab = this.activeFilter();
    return this.listaUnidades().filter(u => {
      const matchTab = tab === 'todos' ? true : tab === 'activos' ? u.estado : !u.estado;
      if (!matchTab) return false;
      if (!q) return true;
      return u.nombre?.toLowerCase().includes(q) || u.codigo?.toLowerCase().includes(q) || u.abreviatura?.toLowerCase().includes(q);
    });
  });

  ngOnInit(): void {
    this.unidadMedidaService.cargar().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    this.colDefs = this.unidadMedidaService.generarColumnasListado();
  }

  setFilter(tab: FilterType) { this.activeFilter.set(tab); }
  onSearch(q: string) { this.searchQuery.set(q); }

  buscar(event: EventCrudBusqueda) {
    this.unidadMedidaService.cargar().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  exportarDesdeHeader() {
    this.exportarSignal.set(true);
  }

  imprimirDesdeHeader() {
    this.imprimirSignal.set(true);
  }

  editarObj(data: CatUnidadMedida) {
    this.formsService.seleccionarObjeto(data);
    this.formsService.accion.set(AccionEnum.EDITAR);
    this.tabsState.cambiarEstadoTab(false);
    this.tabsState.irATab(TabsEnum.EDITAR);
  }

  consultarObj(data: CatUnidadMedida) {
    this.formsService.seleccionarObjeto(data);
    this.formsService.accion.set(AccionEnum.CONSULTAR);
    this.ref = this.dialogService.open(UnidadMedidaFormulario, {
      header: 'Consultar Unidad de Medida',
      modal: true,
      width: '50vw',
      closable: true,
      maximizable: true,
      contentStyle: { overflow: 'auto' }
    });
  }

  cambiarEstados(event: { data: CatUnidadMedida; estado: boolean }) {
    this.cargando.activar();
    if (event.data) {
      event.data.estado = event.estado;
      this.unidadMedidaService.actualizar(event.data)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (resultado) => {
            this.toast.success('La unidad ' + resultado.nombre + ' ha sido ' + (resultado.estado ? 'ACTIVADA' : 'INACTIVADA'));
            this.unidadMedidaService.actualizarElGrid(resultado);
            this.cargando.inactivar();
          }
        });
    }
  }

  eliminarObj(data: CatUnidadMedida) {
    this.cargando.activar();
    if (data) {
      this.unidadMedidaService.eliminar(data)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.toast.success('La unidad de medida ha sido eliminada.');
            this.unidadMedidaService.eliminarDelGrid(data);
            this.cargando.inactivar();
          }
        });
    }
  }
}
