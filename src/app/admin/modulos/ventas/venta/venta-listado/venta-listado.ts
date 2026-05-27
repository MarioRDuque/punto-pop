import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ColDef } from 'ag-grid-community';
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
import { Venta, EstadoVenta } from '../../../../entities/Venta';
import { AccionEnum } from '../../../../enums/accion-enum';
import { EventCrudBusqueda } from '../../../../enums/event-crud-busqueda';

type FilterTab = 'todos' | 'PENDIENTE' | 'COMPLETADA' | 'ANULADA';

@Component({
  selector: 'app-venta-listado',
  standalone: true,
  imports: [CommonModule, Grid, FormsModule, DatePickerModule, ButtonModule, TooltipModule, ListadoToolbar],
  templateUrl: './venta-listado.html',
  providers: [DialogService]
})
export class VentaListado implements OnInit {

  private ventaService = inject(VentaService);
  private toast = inject(ToastService);
  private cargando = inject(CargandoService);
  private formsService = inject(FormsService) as FormsService<Venta>;
  private destroyRef = inject(DestroyRef);
  public dialogService = inject(DialogService);

  public listaVentas = this.ventaService.listaVentas;
  public totalVentas = this.ventaService.totalVentas;
  public subtitulo = 'Listado de ventas';
  public colDefs: ColDef[] = [];
  public ref: DynamicDialogRef<VentaDetalle> | null = null;

  public exportarSignal = signal(false);
  public imprimirSignal = signal(false);

  readonly desde = signal<Date>(this.hace7Dias());
  readonly hasta = signal<Date>(new Date());
  readonly activeFilter = signal<FilterTab>('todos');

  readonly hayMasDatos = computed(() => this.totalVentas() > this.listaVentas().length);

  readonly counts = computed(() => {
    const list = this.listaVentas();
    return {
      todos: list.length,
      PENDIENTE: list.filter(v => v.estado === 'PENDIENTE').length,
      COMPLETADA: list.filter(v => v.estado === 'COMPLETADA').length,
      ANULADA: list.filter(v => v.estado === 'ANULADA').length,
    };
  });

  readonly tabs = computed<ToolbarTab[]>(() => [
    { key: 'todos',      label: 'Todos',       count: this.counts().todos },
    { key: 'PENDIENTE',  label: 'Pendientes',  count: this.counts().PENDIENTE },
    { key: 'COMPLETADA', label: 'Completadas', count: this.counts().COMPLETADA },
    { key: 'ANULADA',    label: 'Anuladas',    count: this.counts().ANULADA },
  ]);

  readonly filteredVentas = computed(() => {
    const tab = this.activeFilter();
    if (tab === 'todos') return this.listaVentas();
    return this.listaVentas().filter(v => v.estado === tab);
  });

  ngOnInit(): void {
    this.cargarConFiltros();
    this.colDefs = this.ventaService.generarColumnasListado();
  }

  setFilter(tab: FilterTab) { this.activeFilter.set(tab); }

  cargarConFiltros(): void {
    const hastaFin = new Date(this.hasta());
    hastaFin.setHours(23, 59, 59, 999);
    this.ventaService.cargar(
      undefined,
      this.desde(),
      hastaFin
    ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  buscar(_event: EventCrudBusqueda): void {
    this.cargarConFiltros();
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
          this.ventaService.actualizarElGrid(resultado);
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
          this.ventaService.actualizarElGrid(resultado);
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
