import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ColDef } from 'ag-grid-community';
import { HeaderCrud } from '../../../component/header-crud/header-crud';
import { Grid } from '../../../component/grid/grid';
import { ComprobanteService } from './comprobante.service';
import { ToastService } from '../../../service/toast.service';
import { CargandoService } from '../../../service/cargando.service';
import { Comprobante } from '../../../entities/Comprobante';
import { EventCrudBusqueda } from '../../../enums/event-crud-busqueda';

@Component({
  selector: 'app-comprobante',
  standalone: true,
  imports: [  HeaderCrud, Grid],
  templateUrl: './app.comprobante.html',
})
export class AppComprobante implements OnInit {

  private comprobanteService = inject(ComprobanteService);
  private toast = inject(ToastService);
  private cargando = inject(CargandoService);
  private destroyRef = inject(DestroyRef);

  public listaComprobantes = this.comprobanteService.listaComprobantes;
  public subtitulo = 'Comprobantes Electrónicos';
  public colDefs: ColDef[] = [];

  public exportarSignal = signal(false);
  public imprimirSignal = signal(false);

  ngOnInit(): void {
    this.comprobanteService.cargar().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    this.colDefs = this.comprobanteService.generarColumnasListado();
  }

  buscar(event: EventCrudBusqueda) {
    // Filtro según necesidad futura
  }

  exportarDesdeHeader() {
    this.exportarSignal.set(true);
  }

  imprimirDesdeHeader() {
    this.imprimirSignal.set(true);
  }

  reintentar(data: Comprobante) {
    if (!data.ventaId) return;
    this.comprobanteService.reintentar(data.ventaId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resultado) => {
          this.toast.success('Reintento enviado para comprobante: ' + resultado.numeroComprobante);
        }
      });
  }
}
