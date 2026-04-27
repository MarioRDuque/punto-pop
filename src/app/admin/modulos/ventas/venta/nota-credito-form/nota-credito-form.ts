import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { TextareaModule } from 'primeng/textarea';
import { TagModule } from 'primeng/tag';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { NotaCreditoService } from '../nota-credito.service';
import { ToastService } from '../../../../service/toast.service';
import { CargandoService } from '../../../../service/cargando.service';
import { ItemVenta, Venta } from '../../../../entities/Venta';
import { NotaCredito, NotaCreditoRequestItem } from '../../../../entities/NotaCredito';

interface LineaNC {
  item: ItemVenta;
  seleccionada: boolean;
  cantidad: number;
  subtotal: number;
}

@Component({
  selector: 'app-nota-credito-form',
  standalone: true,
  imports: [DecimalPipe, FormsModule, ButtonModule, CheckboxModule, TextareaModule, TagModule],
  templateUrl: './nota-credito-form.html',
})
export class NotaCreditoForm implements OnInit {

  private config      = inject(DynamicDialogConfig);
  private dialogRef   = inject(DynamicDialogRef);
  private ncSvc       = inject(NotaCreditoService);
  private toast       = inject(ToastService);
  private cargando    = inject(CargandoService);
  private destroyRef  = inject(DestroyRef);

  venta!: Venta;

  motivo = signal('');
  restaurarStock = signal(false);
  lineas = signal<LineaNC[]>([]);
  resultado = signal<NotaCredito | null>(null);

  readonly totalSinIva = computed(() =>
    this.lineas()
      .filter(l => l.seleccionada)
      .reduce((s, l) => s + l.subtotal, 0)
  );

  readonly iva = computed(() =>
    Math.round(this.totalSinIva() * 0.15 * 100) / 100
  );

  readonly total = computed(() =>
    Math.round((this.totalSinIva() + this.iva()) * 100) / 100
  );

  readonly puedeEmitir = computed(() =>
    this.motivo().trim().length >= 5 &&
    this.lineas().some(l => l.seleccionada && l.cantidad > 0) &&
    this.resultado() === null
  );

  ngOnInit(): void {
    this.venta = this.config.data.venta as Venta;
    this.lineas.set(
      (this.venta.items ?? []).map(item => ({
        item,
        seleccionada: true,
        cantidad: item.cantidad,
        subtotal: item.subtotal,
      }))
    );
  }

  recalcular(linea: LineaNC): void {
    if (linea.cantidad <= 0) linea.cantidad = 0;
    if (linea.cantidad > linea.item.cantidad) linea.cantidad = linea.item.cantidad;
    const proporcion = linea.item.cantidad > 0 ? linea.cantidad / linea.item.cantidad : 0;
    linea.subtotal = Math.round(linea.item.subtotal * proporcion * 100) / 100;
    this.lineas.update(ls => [...ls]);
  }

  emitir(): void {
    if (!this.puedeEmitir() || !this.venta.id) return;

    const items: NotaCreditoRequestItem[] = this.lineas()
      .filter(l => l.seleccionada && l.cantidad > 0)
      .map(l => ({
        productoId: l.item.productoId,
        productoCodigo: l.item.productoCodigo,
        productoNombre: l.item.productoNombre,
        cantidad: l.cantidad,
        precioUnitario: l.item.precioUnitario,
        descuento: l.item.descuento * (l.cantidad / l.item.cantidad),
        subtotal: l.subtotal,
      }));

    this.cargando.activar();
    this.ncSvc.emitir(this.venta.id, {
      motivo: this.motivo(),
      restaurarStock: this.restaurarStock(),
      items,
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (nc) => {
          this.resultado.set(nc);
          this.cargando.inactivar();
          if (nc.estado === 'AUTORIZADO') {
            this.toast.success('Nota de crédito ' + nc.numeroComprobante + ' autorizada');
          } else {
            this.toast.warn('Nota de crédito enviada — estado: ' + nc.estado);
          }
        },
        error: () => {
          this.cargando.inactivar();
        },
      });
  }

  cerrar(): void {
    this.dialogRef.close(this.resultado());
  }

  getSeveridad(estado?: string): 'success' | 'warn' | 'danger' | 'secondary' {
    switch (estado) {
      case 'AUTORIZADO': return 'success';
      case 'ENVIADO':    return 'warn';
      case 'DEVUELTO':
      case 'ERROR':      return 'danger';
      default:           return 'secondary';
    }
  }
}
