import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ColDef, GridApi } from 'ag-grid-community';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TooltipModule } from 'primeng/tooltip';
import { Grid } from '../../../../component/grid/grid';
import { ListadoToolbar, ToolbarTab } from '../../../../component/listado-toolbar/listado-toolbar';
import { VentaService } from '../venta.service';
import { VentaDetalle } from '../venta-detalle/venta-detalle';
import { ToastService } from '../../../../service/toast.service';
import { CargandoService } from '../../../../service/cargando.service';
import { FormsService } from '../../../../service/forms-service';
import { Venta } from '../../../../entities/Venta';
import { AccionEnum } from '../../../../enums/accion-enum';
import { Observable } from 'rxjs';
import { PageResponse } from '../../../../entities/PageResponse';

type FilterTab = 'todos' | 'PENDIENTE' | 'COMPLETADA' | 'ANULADA';

@Component({
  selector: 'app-venta-listado',
  standalone: true,
  imports: [CommonModule, Grid, FormsModule, DatePickerModule, ButtonModule, TooltipModule, ListadoToolbar],
  templateUrl: './venta-listado.html',
  providers: [DialogService]
})
export class VentaListado implements OnInit {

  public ventaService = inject(VentaService);
  private toast = inject(ToastService);
  private cargando = inject(CargandoService);
  private formsService = inject(FormsService) as FormsService<Venta>;
  private destroyRef = inject(DestroyRef);
  public dialogService = inject(DialogService);
  public totalVentas = this.ventaService.totalVentas;
  public subtitulo = 'Listado de ventas';
  public colDefs: ColDef[] = [];
  public ref: DynamicDialogRef<VentaDetalle> | null = null;

  public exportarSignal = signal(false);
  public imprimirSignal = signal(false);

  readonly desde = signal<Date>(this.hace7Dias());
  readonly hasta = signal<Date>(new Date());
  readonly activeFilter = signal<FilterTab>('todos');

  readonly tabs = computed<ToolbarTab[]>(() => [
    { key: 'todos',      label: 'Todos'      },
    { key: 'PENDIENTE',  label: 'Pendientes'  },
    { key: 'COMPLETADA', label: 'Completadas' },
    { key: 'ANULADA',    label: 'Anuladas'    },
  ]);

  readonly searchQuery = signal<string>('');

  private gridApi: GridApi | null = null;

  readonly loadVentas = (startRow: number, endRow: number): Observable<PageResponse<Venta>> => {
    const pageSize = endRow - startRow;
    const page = startRow / pageSize;
    const hastaFin = new Date(this.hasta());
    hastaFin.setHours(23, 59, 59, 999);
    return this.ventaService.cargar(
      this.activeFilter() === 'todos' ? undefined : this.activeFilter(),
      this.desde(),
      hastaFin,
      page,
      this.searchQuery()
    );
  };

  ngOnInit(): void {
    this.colDefs = this.ventaService.generarColumnasListado();
  }

  setFilter(tab: FilterTab) {
    this.activeFilter.set(tab);
    (this.gridApi as any)?.purgeServerSideCache([]);
  }

  recargar(): void {
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

  exportarDesdeHeader() {
    this.exportarSignal.set(true);
  }

  imprimirDesdeHeader() {
    this.imprimirSignal.set(true);
  }

  consultarObj(data: Venta) {
    this.formsService.seleccionarObjeto(data);
    this.formsService.accion.set(AccionEnum.CONSULTAR);
    this.ref = this.dialogService.open(VentaDetalle, {
      header: 'Detalle de venta ' + (data.numero ?? ''),
      modal: true,
      width: '75vw',
      closable: true,
      maximizable: true,
      contentStyle: { overflow: 'auto' }
    });
  }

  completarVenta(data: Venta) {
    if (!data.id) return;
    this.cargando.activar();
    this.ventaService.completar(data.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resultado) => {
          this.toast.success('Venta ' + resultado.numero + ' completada correctamente');
          (this.gridApi as any)?.purgeServerSideCache([]);
          this.cargando.inactivar();
        }
      });
  }

  anularVenta(data: Venta) {
    if (!data.id) return;
    this.cargando.activar();
    this.ventaService.anular(data.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resultado) => {
          this.toast.success('Venta ' + resultado.numero + ' anulada');
          (this.gridApi as any)?.purgeServerSideCache([]);
          this.cargando.inactivar();
        }
      });
  }

  private hace7Dias(): Date {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    d.setHours(0, 0, 0, 0);
    return d;
  }
}
