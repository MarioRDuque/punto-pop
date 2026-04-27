import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { NotaDebitoService } from '../nota-debito.service';
import { ToastService } from '../../../../service/toast.service';
import { CargandoService } from '../../../../service/cargando.service';
import { Venta } from '../../../../entities/Venta';
import { NotaDebito, NotaDebitoMotivo } from '../../../../entities/NotaDebito';

@Component({
  selector: 'app-nota-debito-form',
  standalone: true,
  imports: [DecimalPipe, FormsModule, ButtonModule, TagModule],
  templateUrl: './nota-debito-form.html',
})
export class NotaDebitoForm implements OnInit {

  private config      = inject(DynamicDialogConfig);
  private dialogRef   = inject(DynamicDialogRef);
  private ndSvc       = inject(NotaDebitoService);
  private toast       = inject(ToastService);
  private cargando    = inject(CargandoService);
  private destroyRef  = inject(DestroyRef);

  venta!: Venta;

  motivos = signal<NotaDebitoMotivo[]>([{ descripcion: '', valor: 0 }]);
  resultado = signal<NotaDebito | null>(null);

  readonly totalSinIva = computed(() =>
    this.motivos().reduce((s, m) => s + (m.valor ?? 0), 0)
  );

  readonly iva = computed(() =>
    Math.round(this.totalSinIva() * 0.15 * 100) / 100
  );

  readonly total = computed(() =>
    Math.round((this.totalSinIva() + this.iva()) * 100) / 100
  );

  readonly puedeEmitir = computed(() =>
    this.motivos().every(m => m.descripcion.trim().length >= 3 && m.valor > 0) &&
    this.motivos().length > 0 &&
    this.resultado() === null
  );

  ngOnInit(): void {
    this.venta = this.config.data.venta as Venta;
  }

  agregarMotivo(): void {
    this.motivos.update(ms => [...ms, { descripcion: '', valor: 0 }]);
  }

  quitarMotivo(index: number): void {
    this.motivos.update(ms => ms.filter((_, i) => i !== index));
  }

  trackMotivo(index: number): number {
    return index;
  }

  emitir(): void {
    if (!this.puedeEmitir() || !this.venta.id) return;

    this.cargando.activar();
    this.ndSvc.emitir(this.venta.id, { motivos: this.motivos() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (nd) => {
          this.resultado.set(nd);
          this.cargando.inactivar();
          if (nd.estado === 'AUTORIZADO') {
            this.toast.success('Nota de débito ' + nd.numeroComprobante + ' autorizada');
          } else {
            this.toast.warn('Nota de débito enviada — estado: ' + nd.estado);
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
