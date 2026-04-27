import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ColDef,
  GridApi,
  GridReadyEvent,
  ICellRendererParams,
  Theme,
} from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';
import { AG_GRID_LOCALE_ES } from '@ag-grid-community/locale';
import { myTheme } from '../../../../constantes/ag-grid-theme-builder';
import { HeaderCrud } from '../../../../component/header-crud/header-crud';
import { CompraService } from '../compra.service';
import { ToastService } from '../../../../service/toast.service';
import { CargandoService } from '../../../../service/cargando.service';
import { Compra } from '../../../../entities/Compra';

@Component({
  selector: 'app-compra-listado',
  standalone: true,
  imports: [HeaderCrud, AgGridAngular],
  templateUrl: './compra-listado.html',
})
export class CompraListado implements OnInit {

  readonly compraService = inject(CompraService);
  private readonly toast = inject(ToastService);
  private readonly cargando = inject(CargandoService);
  private readonly destroyRef = inject(DestroyRef);

  public readonly subtitulo = 'Listado de compras';
  public readonly exportarSignal = signal(false);
  public readonly imprimirSignal = signal(false);

  private gridApi!: GridApi<Compra>;
  public theme: Theme = myTheme;
  public localeText = AG_GRID_LOCALE_ES;
  public gridContext = { component: this };

  public readonly defaultColDef: ColDef = {
    resizable: true,
    sortable: true,
    filter: true,
    suppressMovable: true,
    suppressHeaderMenuButton: true,
  };

  public readonly columnDefs: ColDef<Compra>[] = [
    { field: 'numero',          headerName: 'N°',        width: 110 },
    { field: 'fecha',           headerName: 'Fecha',     width: 160,
      valueFormatter: (p) => p.value ? new Date(p.value).toLocaleString('es-EC') : '' },
    { field: 'proveedorNombre', headerName: 'Proveedor', flex: 1, minWidth: 160 },
    {
      field: 'total', headerName: 'Total', width: 110, type: 'rightAligned',
      valueFormatter: (p) => p.value != null ? `$${Number(p.value).toFixed(2)}` : '',
    },
    {
      field: 'estado', headerName: 'Estado', width: 110,
      cellStyle: (p) => {
        const colors: Record<string, string> = {
          BORRADOR: '#f59e0b', RECIBIDA: '#22c55e', ANULADA: '#ef4444',
        };
        return { color: colors[p.value] ?? '', fontWeight: '600' };
      },
    },
    {
      headerName: 'Acciones',
      width: 160,
      sortable: false,
      filter: false,
      resizable: false,
      cellRenderer: (params: ICellRendererParams<Compra>) => {
        const estado = params.data?.estado;
        const div = document.createElement('div');
        div.style.cssText = 'display:flex;gap:4px;align-items:center;height:100%;padding:2px 0';

        if (estado === 'BORRADOR') {
          const btnRecibir = document.createElement('button');
          btnRecibir.textContent = 'Recibir';
          btnRecibir.style.cssText =
            'background:#22c55e;border:none;color:white;padding:2px 8px;border-radius:4px;cursor:pointer;font-size:11px;font-weight:600';
          btnRecibir.onclick = () =>
            (params.context as { component: CompraListado }).component.recibirCompra(params.data!);
          div.appendChild(btnRecibir);

          const btnAnular = document.createElement('button');
          btnAnular.textContent = 'Anular';
          btnAnular.style.cssText =
            'background:#ef4444;border:none;color:white;padding:2px 8px;border-radius:4px;cursor:pointer;font-size:11px;font-weight:600';
          btnAnular.onclick = () =>
            (params.context as { component: CompraListado }).component.anularCompra(params.data!);
          div.appendChild(btnAnular);
        }

        return div;
      },
    },
  ];

  ngOnInit(): void {
    this.compraService.cargar().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  onGridReady(event: GridReadyEvent<Compra>): void {
    this.gridApi = event.api;
  }

  exportarDesdeHeader(): void {
    this.gridApi?.exportDataAsExcel({ fileName: 'Compras.xlsx' });
  }

  imprimirDesdeHeader(): void {
    this.imprimirSignal.set(true);
  }

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
