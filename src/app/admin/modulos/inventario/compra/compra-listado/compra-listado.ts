import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ColDef, GridApi } from 'ag-grid-community';
import { Grid } from '../../../../component/grid/grid';
import { ListadoToolbar, ToolbarTab } from '../../../../component/listado-toolbar/listado-toolbar';
import { CompraService } from '../compra.service';
import { ToastService } from '../../../../service/toast.service';
import { CargandoService } from '../../../../service/cargando.service';
import { Compra } from '../../../../entities/Compra';
import { Observable } from 'rxjs';
import { PageResponse } from '../../../../entities/PageResponse';

type FilterTab = 'todos' | 'borrador' | 'recibidas' | 'anuladas';

@Component({
  selector: 'app-compra-listado',
  standalone: true,
  imports: [CommonModule, Grid, ListadoToolbar],
  templateUrl: './compra-listado.html',
})
export class CompraListado implements OnInit {
  public readonly compraService = inject(CompraService);
  private readonly toast = inject(ToastService);
  private readonly cargando = inject(CargandoService);
  private readonly destroyRef = inject(DestroyRef);

  public readonly subtitulo = 'Listado de compras';
  public readonly exportarSignal = signal(false);
  public readonly imprimirSignal = signal(false);

  readonly activeFilter = signal<FilterTab>('todos');

  public colDefs: ColDef[] = [];

  readonly searchQuery = signal<string>('');

  public readonly totalCompras = this.compraService.totalCompras;

  readonly tabs = computed<ToolbarTab[]>(() => [
    { key: 'todos',     label: 'Todas'     },
    { key: 'borrador',  label: 'Borrador'  },
    { key: 'recibidas', label: 'Recibidas' },
    { key: 'anuladas',  label: 'Anuladas'  },
  ]);

  private gridApi: GridApi | null = null;

  readonly loadCompras = (startRow: number, endRow: number): Observable<PageResponse<Compra>> => {
    const pageSize = endRow - startRow;
    const page = startRow / pageSize;
    return this.compraService.cargar(
      this.activeFilter() === 'todos' ? undefined : this.activeFilter().toUpperCase(),
      page, pageSize, this.searchQuery()
    );
  };

  ngOnInit(): void {
    this.colDefs = this.compraService.generarColumnasListado(
      (compra) => this.recibirCompra(compra),
      (compra) => this.anularCompra(compra),
    );
  }

  setFilter(tab: FilterTab) {
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

  exportarDesdeHeader() { this.exportarSignal.set(true); }
  imprimirDesdeHeader() { this.imprimirSignal.set(true); }

  recibirCompra(compra: Compra): void {
    if (!compra.id) return;
    this.cargando.activar();
    this.compraService.recibir(compra.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.toast.success(`Compra ${data.numero} recibida — stock actualizado`);
          this.gridApi?.refreshServerSide({ route: [], purge: true });
          this.cargando.inactivar();
        },
      });
  }

  anularCompra(compra: Compra): void {
    if (!compra.id) return;
    this.cargando.activar();
    this.compraService.anular(compra.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.toast.success(`Compra ${data.numero} anulada`);
          this.gridApi?.refreshServerSide({ route: [], purge: true });
          this.cargando.inactivar();
        },
      });
  }
}
