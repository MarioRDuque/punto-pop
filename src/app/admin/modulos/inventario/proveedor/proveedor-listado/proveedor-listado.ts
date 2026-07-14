import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ColDef, GridApi } from 'ag-grid-enterprise';
import { Grid } from '../../../../component/grid/grid';
import { ListadoToolbar, ToolbarTab } from '../../../../component/listado-toolbar/listado-toolbar';
import { ProveedorService } from '../proveedor.service';
import { ProveedorFormulario } from '../proveedor-formulario/proveedor-formulario';
import { ToastService } from '../../../../service/toast.service';
import { CargandoService } from '../../../../service/cargando.service';
import { FormsService } from '../../../../service/forms-service';
import { TabsStateService } from '../../../../service/tabs.service';
import { Proveedor } from '../../../../entities/Proveedor';
import { AccionEnum } from '../../../../enums/accion-enum';
import { TabsEnum } from '../../../../enums/tabs-enum';
import { Observable } from 'rxjs';
import { PageResponse } from '../../../../entities/PageResponse';

type FilterType = 'todos' | 'activos' | 'inactivos' | 'incompletos';

@Component({
  selector: 'app-proveedor-listado',
  standalone: true,
  imports: [CommonModule, FormsModule, Grid, ListadoToolbar],
  templateUrl: './proveedor-listado.html',
  providers: [DialogService],
})
export class ProveedorListado implements OnInit {

  private readonly proveedorService = inject(ProveedorService);
  private readonly toast            = inject(ToastService);
  private readonly cargando         = inject(CargandoService);
  private readonly formsService     = inject(FormsService) as FormsService<Proveedor>;
  private readonly tabsState        = inject(TabsStateService);
  private readonly destroyRef       = inject(DestroyRef);
  public  readonly dialogService    = inject(DialogService);

  public readonly subtitulo = 'Listado de proveedores';
  public colDefs: ColDef[] = [];
  public ref: DynamicDialogRef<ProveedorFormulario> | null = null;

  public readonly exportarSignal = signal(false);
  public readonly imprimirSignal = signal(false);

  readonly activeFilter = signal<FilterType>('todos');

  readonly tabs = computed<ToolbarTab[]>(() => [
    { key: 'todos',       label: 'Todos'       },
    { key: 'activos',     label: 'Activos'      },
    { key: 'inactivos',   label: 'Inactivos'    },
    { key: 'incompletos', label: 'Incompletos'  },
  ]);

  readonly searchQuery = signal<string>('');

  private gridApi: GridApi | null = null;

  readonly loadProveedores = (startRow: number, endRow: number): Observable<PageResponse<Proveedor>> => {
    const pageSize = endRow - startRow;
    const page = startRow / pageSize;
    return this.proveedorService.cargar(
      this.activeFilter() === 'todos' ? undefined : this.activeFilter(),
      page, pageSize, this.searchQuery()
    );
  };

  ngOnInit(): void {
    this.colDefs = this.proveedorService.generarColumnasListado();
  }

  setFilter(tab: FilterType) {
    this.activeFilter.set(tab);
    this.gridApi?.refreshServerSide({ route: [], purge: true });
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
      this.gridApi?.refreshServerSide({ route: [], purge: true });
      return;
    }
    if ((this.gridApi?.getDisplayedRowCount() ?? 0) === 0) {
      this.gridApi?.refreshServerSide({ route: [], purge: true });
    }
  }

  onGridReady(api: GridApi): void {
    this.gridApi = api;
  }

  exportarDesdeHeader(): void { this.exportarSignal.set(true); }
  imprimirDesdeHeader(): void { this.imprimirSignal.set(true); }

  editarObj(data: Proveedor): void {
    this.formsService.seleccionarObjeto(data);
    this.formsService.accion.set(AccionEnum.EDITAR);
    this.tabsState.cambiarEstadoTab(false);
    this.tabsState.irATab(TabsEnum.EDITAR);
  }

  consultarObj(data: Proveedor): void {
    this.formsService.seleccionarObjeto(data);
    this.formsService.accion.set(AccionEnum.CONSULTAR);
    this.ref = this.dialogService.open(ProveedorFormulario, {
      header: 'Detalle de proveedor',
      modal: true,
      width: '55vw',
      closable: true,
      maximizable: true,
      contentStyle: { overflow: 'auto' },
    });
  }

  cambiarEstados(event: { data: Proveedor; estado: boolean }): void {
    if (!event.data) return;
    this.cargando.activar();
    const actualizado = { ...event.data, estado: event.estado };
    this.proveedorService
      .actualizar(actualizado)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.toast.success(`Proveedor ${data.razonSocial} → ${data.estado ? 'ACTIVO' : 'INACTIVO'}`);
          this.gridApi?.refreshServerSide({ route: [], purge: true });
          this.cargando.inactivar();
        },
      });
  }

  eliminarObj(data: Proveedor): void {
    if (!data?.ruc) return;
    this.cargando.activar();
    this.proveedorService
      .eliminar(data)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toast.success('Proveedor eliminado');
          this.gridApi?.refreshServerSide({ route: [], purge: true });
          this.cargando.inactivar();
        },
      });
  }
}
