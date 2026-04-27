import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap, finalize } from 'rxjs';
import { ColDef } from 'ag-grid-enterprise';
import { ApiService } from '../../../service/api.service';
import { CargandoService } from '../../../service/cargando.service';
import { UtilService } from '../../../service/util.service';
import { Comprobante } from '../../../entities/Comprobante';

@Injectable({ providedIn: 'root' })
export class ComprobanteService {

  private readonly api = inject(ApiService);
  private readonly cargando = inject(CargandoService);
  private readonly utilService = inject(UtilService);

  readonly listaComprobantes = signal<Comprobante[]>([]);

  obtenerPorVenta(ventaId: string): Observable<Comprobante> {
    this.cargando.activar();
    return this.api.get<Comprobante>(`/facturacion/comprobante/${ventaId}`).pipe(
      finalize(() => this.cargando.inactivar())
    );
  }

  reintentar(ventaId: string): Observable<Comprobante> {
    this.cargando.activar();
    return this.api.post<Comprobante>(`/facturacion/comprobante/${ventaId}/reintentar`, {}).pipe(
      tap((data) => {
        this.listaComprobantes.update((list) =>
          list.map((c) => (c.ventaId === ventaId ? data : c))
        );
      }),
      finalize(() => this.cargando.inactivar())
    );
  }

  cargar(): Observable<Comprobante[]> {
    this.cargando.activar();
    return this.api.get<Comprobante[]>('/facturacion/comprobante').pipe(
      tap((data) => this.listaComprobantes.set(data)),
      finalize(() => this.cargando.inactivar())
    );
  }

  generarColumnasListado(): ColDef[] {
    return [
      { headerName: 'ID Venta', field: 'ventaId', width: 200, minWidth: 150 },
      { headerName: 'Clave Acceso', field: 'claveAcceso', width: 220, minWidth: 150 },
      { headerName: 'N° Comprobante', field: 'numeroComprobante', width: 160, minWidth: 120 },
      { headerName: 'Estado', field: 'estado', width: 120, minWidth: 100 },
      { headerName: 'N° Autorización', field: 'numeroAutorizacion', width: 160, minWidth: 120 },
      { headerName: 'Fecha Autorización', field: 'fechaAutorizacion', width: 180, minWidth: 140 },
      this.utilService.getColumnaAcciones(),
    ];
  }
}
