import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ColDef } from 'ag-grid-community';
import { Grid } from '../../../../component/grid/grid';
import { ListadoToolbar, ToolbarTab } from '../../../../component/listado-toolbar/listado-toolbar';
import { CompraService } from '../compra.service';
import { ToastService } from '../../../../service/toast.service';
import { CargandoService } from '../../../../service/cargando.service';
import { Compra, EstadoCompra } from '../../../../entities/Compra';
import { EventCrudBusqueda } from '../../../../enums/event-crud-busqueda';

type FilterTab = 'todos' | 'borrador' | 'recibidas' | 'anuladas';

@Component({
  selector: 'app-compra-listado',
  standalone: true,
  imports: [CommonModule, Grid, ListadoToolbar],
  templateUrl: './compra-listado.html',
})
export class CompraListado implements OnInit {
  private readonly compraService = inject(CompraService);
  private readonly toast = inject(ToastService);
  private readonly cargando = inject(CargandoService);
  private readonly destroyRef = inject(DestroyRef);

  public readonly subtitulo = 'Listado de compras';
  public readonly exportarSignal = signal(false);
  public readonly imprimirSignal = signal(false);

  readonly searchQuery = signal('');
  readonly activeFilter = signal<FilterTab>('todos');

  public colDefs: ColDef[] = [];

  private readonly listaCompras = this.compraService.listaCompras;

  readonly counts = computed(() => {
    const list = this.listaCompras();
    return {
      todos:     list.length,
      borrador:  list.filter((c) => c.estado === 'BORRADOR').length,
      recibidas: list.filter((c) => c.estado === 'RECIBIDA').length,
      anuladas:  list.filter((c) => c.estado === 'ANULADA').length,
    };
  });

  readonly tabs = computed<ToolbarTab[]>(() => [
    { key: 'todos',     label: 'Todas',     count: this.counts().todos },
    { key: 'borrador',  label: 'Borrador',  count: this.counts().borrador },
    { key: 'recibidas', label: 'Recibidas', count: this.counts().recibidas },
    { key: 'anuladas',  label: 'Anuladas',  count: this.counts().anuladas },
  ]);

  readonly filteredCompras = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const tab = this.activeFilter();
    const estadoMap: Record<FilterTab, EstadoCompra | null> = {
      todos: null, borrador: 'BORRADOR', recibidas: 'RECIBIDA', anuladas: 'ANULADA',
    };
    return this.listaCompras().filter((c) => {
      const estadoFiltro = estadoMap[tab];
      if (estadoFiltro && c.estado !== estadoFiltro) return false;
      if (!q) return true;
      return (
        c.numero?.toLowerCase().includes(q) ||
        c.proveedorNombre?.toLowerCase().includes(q) ||
        (c.fecha ? new Date(c.fecha).toLocaleString('es-EC').toLowerCase().includes(q) : false)
      );
    });
  });

  ngOnInit(): void {
    this.compraService.cargar().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    this.colDefs = this.compraService.generarColumnasListado(
      (compra) => this.recibirCompra(compra),
      (compra) => this.anularCompra(compra),
    );
  }

  setFilter(tab: FilterTab) { this.activeFilter.set(tab); }
  onSearch(q: string)       { this.searchQuery.set(q); }

  buscar(_event: EventCrudBusqueda) {
    this.compraService.cargar().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
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
          this.compraService.actualizarElGrid(data);
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
          this.compraService.actualizarElGrid(data);
          this.cargando.inactivar();
        },
      });
  }
}
