import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DecimalPipe, DatePipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { VentaService } from '../venta.service';
import { NotaEntregaService } from '../nota-entrega.service';
import { FormsService } from '../../../../service/forms-service';
import { ToastService } from '../../../../service/toast.service';
import { CargandoService } from '../../../../service/cargando.service';
import { TabsStateService } from '../../../../service/tabs.service';
import { Venta } from '../../../../entities/Venta';
import { Comprobante } from '../../../../entities/Comprobante';
import { AccionEnum } from '../../../../enums/accion-enum';
import { TabsEnum } from '../../../../enums/tabs-enum';
import { NotaCreditoForm } from '../nota-credito-form/nota-credito-form';
import { NotaDebitoForm } from '../nota-debito-form/nota-debito-form';

@Component({
  selector: 'app-venta-detalle',
  standalone: true,
  imports: [DecimalPipe, DatePipe, ButtonModule, TagModule],
  templateUrl: './venta-detalle.html',
  providers: [DialogService],
})
export class VentaDetalle implements OnInit {

  private ventaService      = inject(VentaService);
  private notaEntregaSvc    = inject(NotaEntregaService);
  private formsService      = inject(FormsService) as FormsService<Venta>;
  private toast             = inject(ToastService);
  private cargando          = inject(CargandoService);
  private tabsState         = inject(TabsStateService);
  private destroyRef        = inject(DestroyRef);
  private dialogService     = inject(DialogService);

  public dialogRef = inject(DynamicDialogRef, { optional: true });

  public venta: Venta | null = null;
  public accion  = this.formsService.accion;
  public accionEnum = AccionEnum;

  readonly cargandoNota = signal(false);
  readonly comprobante = signal<Comprobante | null>(null);
  readonly cargandoComp = signal(false);


  ngOnInit(): void {
    this.venta = this.formsService.objetoSeleccionado();
    if (this.venta?.id) {
      this.cargarComprobante(this.venta.id);
    }
  }

  private cargarComprobante(ventaId: string): void {
    this.cargandoComp.set(true);
    this.ventaService.obtenerComprobante(ventaId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (c) => { this.comprobante.set(c); this.cargandoComp.set(false); },
        error: () => { this.cargandoComp.set(false); },
      });
  }

  get esEditar(): boolean {
    return this.accion() === AccionEnum.EDITAR;
  }

  get puedeEmitirNC(): boolean {
    return this.comprobante()?.estado === 'AUTORIZADO';
  }

  completar(): void {
    if (!this.venta?.id) return;
    this.cargando.activar();
    this.ventaService.completar(this.venta.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resultado) => {
          this.toast.success('Venta ' + resultado.numero + ' completada');
          this.ventaService.actualizarElGrid(resultado);
          this.venta = resultado;
          this.cargando.inactivar();
        }
      });
  }

  anular(): void {
    if (!this.venta?.id) return;
    this.cargando.activar();
    this.ventaService.anular(this.venta.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resultado) => {
          this.toast.success('Venta ' + resultado.numero + ' anulada');
          this.ventaService.actualizarElGrid(resultado);
          this.venta = resultado;
          this.cargando.inactivar();
        }
      });
  }

  imprimirNotaEntrega(): void {
    if (!this.venta?.id) return;
    this.cargandoNota.set(true);
    this.notaEntregaSvc.obtener(this.venta.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (nota) => {
          this.notaEntregaSvc.imprimir(nota);
          this.cargandoNota.set(false);
        },
        error: () => {
          this.toast.error('No se pudo generar la nota de entrega');
          this.cargandoNota.set(false);
        }
      });
  }

  abrirNotaCredito(): void {
    if (!this.venta) return;
    this.dialogService.open(NotaCreditoForm, {
      header: 'Nota de Crédito — Venta ' + (this.venta.numero ?? ''),
      modal: true,
      width: '70vw',
      closable: false,
      maximizable: true,
      contentStyle: { overflow: 'auto' },
      data: { venta: this.venta },
    });
  }

  abrirNotaDebito(): void {
    if (!this.venta) return;
    this.dialogService.open(NotaDebitoForm, {
      header: 'Nota de Débito — Venta ' + (this.venta.numero ?? ''),
      modal: true,
      width: '55vw',
      closable: false,
      maximizable: false,
      contentStyle: { overflow: 'auto' },
      data: { venta: this.venta },
    });
  }

  cerrar(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    } else {
      this.tabsState.irATab(TabsEnum.LISTADO);
    }
  }

  getSeveridad(estado?: string): 'success' | 'warn' | 'danger' | 'secondary' {
    switch (estado) {
      case 'COMPLETADA': return 'success';
      case 'PENDIENTE':  return 'warn';
      case 'ANULADA':    return 'danger';
      default:           return 'secondary';
    }
  }

  getSeveridadComp(estado?: string): 'success' | 'warn' | 'danger' | 'secondary' {
    switch (estado) {
      case 'AUTORIZADO': return 'success';
      case 'ENVIADO':    return 'warn';
      case 'DEVUELTO':
      case 'ERROR':      return 'danger';
      default:           return 'secondary';
    }
  }
}
