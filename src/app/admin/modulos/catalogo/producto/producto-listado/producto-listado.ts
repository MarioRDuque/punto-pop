import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ColDef, GridApi } from 'ag-grid-community';
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
import { Observable } from 'rxjs';
import { PageResponse } from '../../../../entities/PageResponse';

type FilterType = 'todos' | 'activos' | 'inactivos' | 'sin-stock';

@Component({
  selector: 'app-producto-listado',
  standalone: true,
  imports: [CommonModule, FormsModule, Grid, ListadoToolbar],
  templateUrl: './producto-listado.html',
  providers: [DialogService]
})
export class ProductoListado implements OnInit {

  public productoService = inject(ProductoService);
  private toast = inject(ToastService);
  private cargando = inject(CargandoService);
  private formsService = inject(FormsService) as FormsService<CatProducto>;
  private tabsState = inject(TabsStateService);
  private destroyRef = inject(DestroyRef);
  public dialogService = inject(DialogService);

  public totalProductos = this.productoService.totalProductos;
  public subtitulo = 'Listado de productos';
  public colDefs: ColDef[] = [];
  public ref: DynamicDialogRef<ProductoFormulario> | null = null;

  public exportarSignal = signal(false);
  public imprimirSignal = signal(false);

  readonly activeFilter = signal<FilterType>('todos');

  readonly tabs = computed<ToolbarTab[]>(() => [
    { key: 'todos',     label: 'Todos'     },
    { key: 'activos',   label: 'Activos'   },
    { key: 'inactivos', label: 'Inactivos' },
    { key: 'sin-stock', label: 'Sin stock' },
  ]);

  readonly searchQuery = signal<string>('');

  private gridApi: GridApi | null = null;

  readonly loadProductos = (startRow: number, endRow: number): Observable<PageResponse<CatProducto>> => {
    const pageSize = endRow - startRow;
    const page = startRow / pageSize;
    return this.productoService.cargar(
      this.activeFilter() === 'todos' ? undefined : this.activeFilter(),
      page, pageSize, this.searchQuery()
    );
  };

  ngOnInit(): void {
    this.colDefs = this.productoService.generarColumnasListado();
  }

  setFilter(tab: FilterType) {
    this.activeFilter.set(tab);
    (this.gridApi as any)?.purgeServerSideCache([]);
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
    this.gridApi?.setGridOption('quickFilterText', value);
  }

  onSearchSubmit(texto: string): void {
    const value = texto?.trim() ?? '';
    if (!value) {
      this.searchQuery.set('');
      this.gridApi?.setGridOption('quickFilterText', '');
      (this.gridApi as any)?.purgeServerSideCache([]);
      return;
    }
    if ((this.gridApi?.getDisplayedRowCount() ?? 0) === 0) {
      (this.gridApi as any)?.purgeServerSideCache([]);
    }
  }

  onGridReady(api: GridApi): void {
    this.gridApi = api;
  }

  exportarDesdeHeader() { this.exportarSignal.set(true); }
  imprimirDesdeHeader() { this.imprimirSignal.set(true); }

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
            (this.gridApi as any)?.purgeServerSideCache([]);
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
            (this.gridApi as any)?.purgeServerSideCache([]);
            this.cargando.inactivar();
          }
        });
    }
  }
}
