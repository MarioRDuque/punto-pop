import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ColDef } from 'ag-grid-community';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { Grid } from '../../../../component/grid/grid';
import { VentaService } from '../venta.service';
import { VentaDetalle } from '../venta-detalle/venta-detalle';
import { ToastService } from '../../../../service/toast.service';
import { CargandoService } from '../../../../service/cargando.service';
import { FormsService } from '../../../../service/forms-service';
import { Venta, EstadoVenta } from '../../../../entities/Venta';
import { AccionEnum } from '../../../../enums/accion-enum';
import { EventCrudBusqueda } from '../../../../enums/event-crud-busqueda';

@Component({
  selector: 'app-venta-listado',
  standalone: true,
  imports: [Grid, FormsModule, DatePickerModule, SelectModule, ButtonModule, TooltipModule],
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
  readonly estado = signal<EstadoVenta | null>(null);

  readonly hayMasDatos = computed(() => this.totalVentas() > this.listaVentas().length);

  readonly estadosOptions: { label: string; value: EstadoVenta | null }[] = [
    { label: 'Todos los estados', value: null },
    { label: 'Pendiente', value: 'PENDIENTE' },
    { label: 'Completada', value: 'COMPLETADA' },
    { label: 'Anulada', value: 'ANULADA' },
  ];

  ngOnInit(): void {
    this.cargarConFiltros();
    this.colDefs = this.ventaService.generarColumnasListado();
  }

  cargarConFiltros(): void {
    const hastaFin = new Date(this.hasta());
    hastaFin.setHours(23, 59, 59, 999);
    this.ventaService.cargar(
      this.estado() ?? undefined,
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
