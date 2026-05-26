import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { FloatLabelModule } from 'primeng/floatlabel';
import { DatePickerModule } from 'primeng/datepicker';
import { ReportesService } from '../reportes.service';
import { CargandoService } from '../../../service/cargando.service';
import { ToastService } from '../../../service/toast.service';
import { EstadoVenta } from '../../../entities/Venta';

@Component({
  selector: 'app-reporte',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    
    PanelModule,
    ButtonModule,
    SelectModule,
    FloatLabelModule,
    DatePickerModule,
  ],
  templateUrl: './app.reporte.html',
})
export class AppReporte {

  private reportesService = inject(ReportesService);
  private cargando = inject(CargandoService);
  private toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);

  public estadosVenta: { label: string; value: EstadoVenta | null }[] = [
    { label: 'Todos', value: null },
    { label: 'Pendiente', value: 'PENDIENTE' },
    { label: 'Completada', value: 'COMPLETADA' },
    { label: 'Anulada', value: 'ANULADA' },
  ];

  public filtrosVentas = this.fb.group({
    estado: [null as EstadoVenta | null],
    desde: [null as Date | null],
    hasta: [null as Date | null],
  });

  private getFiltrosVentas(): { estado?: string; desde?: string; hasta?: string } {
    const v = this.filtrosVentas.getRawValue();
    return {
      estado: v.estado ?? undefined,
      desde: v.desde ? v.desde.toISOString().split('T')[0] : undefined,
      hasta: v.hasta ? v.hasta.toISOString().split('T')[0] : undefined,
    };
  }

  descargarVentasPdf() {
    this.cargando.activar();
    const f = this.getFiltrosVentas();
    this.reportesService.ventasPdf(f.estado, f.desde, f.hasta)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob) => {
          this.reportesService.abrirBlob(blob, 'reporte-ventas.pdf');
          this.cargando.inactivar();
        },
        error: () => {
          this.toast.error('Error al descargar el reporte PDF');
          this.cargando.inactivar();
        }
      });
  }

  descargarVentasXlsx() {
    this.cargando.activar();
    const f = this.getFiltrosVentas();
    this.reportesService.ventasXlsx(f.estado, f.desde, f.hasta)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob) => {
          this.reportesService.abrirBlob(blob, 'reporte-ventas.xlsx');
          this.cargando.inactivar();
        },
        error: () => {
          this.toast.error('Error al descargar el reporte Excel');
          this.cargando.inactivar();
        }
      });
  }

  descargarStock(formato: 'pdf' | 'xlsx') {
    this.cargando.activar();
    const obs = formato === 'pdf' ? this.reportesService.stockPdf() : this.reportesService.stockXlsx();
    obs.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (blob) => {
        this.reportesService.abrirBlob(blob, `reporte-stock.${formato}`);
        this.cargando.inactivar();
      },
      error: () => {
        this.toast.error('Error al descargar el reporte de stock');
        this.cargando.inactivar();
      }
    });
  }

  descargarUsuarios() {
    this.cargando.activar();
    this.reportesService.usuariosPdf()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob) => {
          this.reportesService.abrirBlob(blob, 'reporte-usuarios.pdf');
          this.cargando.inactivar();
        },
        error: () => {
          this.toast.error('Error al descargar el reporte de usuarios');
          this.cargando.inactivar();
        }
      });
  }
}
