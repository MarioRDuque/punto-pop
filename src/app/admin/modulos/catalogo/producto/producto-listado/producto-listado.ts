import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ColDef } from 'ag-grid-community';
import { Grid } from '../../../../component/grid/grid';
import { ListadoToolbar, ToolbarTab } from '../../../../component/listado-toolbar/listado-toolbar';
import { ProductoService } from '../producto.service';
import { ProductoFormulario } from '../producto-formulario/producto-formulario';
import { ToastService } from '../../../../service/toast.service';
import { CargandoService } from '../../../../service/cargando.service';
import { FormsService } from '../../../../service/forms-service';
import { TabsStateService } from '../../../../service/tabs.service';
import { CatProducto } from '../../../../entities/CatProducto';
import { AccionEnum } from '../../../../enums/accion-enum';
import { TabsEnum } from '../../../../enums/tabs-enum';
import { EventCrudBusqueda } from '../../../../enums/event-crud-busqueda';

type FilterType = 'todos' | 'activos' | 'inactivos' | 'sin-stock';

@Component({
  selector: 'app-producto-listado',
  standalone: true,
  imports: [CommonModule, FormsModule, Grid, ListadoToolbar],
  templateUrl: './producto-listado.html',
  providers: [DialogService]
})
export class ProductoListado implements OnInit {

  private productoService = inject(ProductoService);
  private toast = inject(ToastService);
  private cargando = inject(CargandoService);
  private formsService = inject(FormsService) as FormsService<CatProducto>;
  private tabsState = inject(TabsStateService);
  private destroyRef = inject(DestroyRef);
  public dialogService = inject(DialogService);

  public listaProductos = this.productoService.listaProductos;
  public subtitulo = 'Listado de productos';
  public colDefs: ColDef[] = [];
  public ref: DynamicDialogRef<ProductoFormulario> | null = null;

  public exportarSignal = signal(false);
  public imprimirSignal = signal(false);

  readonly searchQuery = signal('');
  readonly activeFilter = signal<FilterType>('todos');

  readonly counts = computed(() => {
    const list = this.listaProductos();
    return {
      todos: list.length,
      activos: list.filter(p => p.estado).length,
      inactivos: list.filter(p => !p.estado).length,
      sinStock: list.filter(p => (p.stock ?? 0) <= 0).length,
    };
  });

  readonly tabs = computed<ToolbarTab[]>(() => [
    { key: 'todos',     label: 'Todos',     count: this.counts().todos },
    { key: 'activos',   label: 'Activos',   count: this.counts().activos },
    { key: 'inactivos', label: 'Inactivos', count: this.counts().inactivos },
    { key: 'sin-stock', label: 'Sin stock', count: this.counts().sinStock },
  ]);

  readonly filteredProductos = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const tab = this.activeFilter();
    return this.listaProductos().filter(p => {
      const matchTab = tab === 'todos' ? true : tab === 'activos' ? p.estado : tab === 'inactivos' ? !p.estado : (p.stock ?? 0) <= 0;
      if (!matchTab) return false;
      if (!q) return true;
      return p.nombre?.toLowerCase().includes(q) || p.codigo?.toLowerCase().includes(q) || p.categoriaNombre?.toLowerCase().includes(q);
    });
  });

  ngOnInit(): void {
    this.productoService.cargar().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    this.colDefs = this.productoService.generarColumnasListado();
  }

  setFilter(tab: FilterType) { this.activeFilter.set(tab); }
  onSearch(q: string) { this.searchQuery.set(q); }

  buscar(event: EventCrudBusqueda) {
    this.productoService.cargar().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  exportarDesdeHeader() {
    this.exportarSignal.set(true);
  }

  imprimirDesdeHeader() {
    this.imprimirSignal.set(true);
  }

  editarObj(data: CatProducto) {
    this.formsService.seleccionarObjeto(data);
    this.formsService.accion.set(AccionEnum.EDITAR);
    this.tabsState.cambiarEstadoTab(false);
    this.tabsState.irATab(TabsEnum.EDITAR);
  }

  consultarObj(data: CatProducto) {
    this.formsService.seleccionarObjeto(data);
    this.formsService.accion.set(AccionEnum.CONSULTAR);
    this.ref = this.dialogService.open(ProductoFormulario, {
      header: 'Consultar Producto',
      modal: true,
      width: '70vw',
      closable: true,
      maximizable: true,
      contentStyle: { overflow: 'auto' }
    });
  }

  cambiarEstados(event: { data: CatProducto; estado: boolean }) {
    this.cargando.activar();
    if (event.data) {
      event.data.estado = event.estado;
      this.productoService.actualizar(event.data)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (resultado) => {
            this.toast.success('El producto ' + resultado.nombre + ' ha sido ' + (resultado.estado ? 'ACTIVADO' : 'INACTIVADO'));
            this.productoService.actualizarElGrid(resultado);
            this.cargando.inactivar();
          }
        });
    }
  }

  eliminarObj(data: CatProducto) {
    this.cargando.activar();
    if (data) {
      this.productoService.eliminar(data)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.toast.success('El producto ha sido eliminado.');
            this.productoService.eliminarDelGrid(data);
            this.cargando.inactivar();
          }
        });
    }
  }
}
