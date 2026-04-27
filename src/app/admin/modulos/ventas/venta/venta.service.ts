import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap, finalize } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ColDef } from 'ag-grid-enterprise';
import { ApiService } from '../../../service/api.service';
import { CargandoService } from '../../../service/cargando.service';
import { CacheService } from '../../../service/cache.service';
import { UtilService } from '../../../service/util.service';
import { Venta } from '../../../entities/Venta';
import { Comprobante } from '../../../entities/Comprobante';
import { PageResponse } from '../../../entities/PageResponse';

const CACHE_KEY = 'ventas';
const PAGE_SIZE = 200;

@Injectable({ providedIn: 'root' })
export class VentaService {

  private readonly api = inject(ApiService);
  private readonly cargando = inject(CargandoService);
  private readonly cache = inject(CacheService);
  private readonly utilService = inject(UtilService);

  readonly listaVentas = signal<Venta[]>([]);
  readonly totalVentas = signal<number>(0);

  guardar(venta: Venta): Observable<Venta> {
    return this.api.post<Venta>('/ventas/venta', venta).pipe(
      tap(() => this.cache.invalidar(CACHE_KEY))
    );
  }

  actualizar(venta: Venta): Observable<Venta> {
    return this.api.put<Venta>(`/ventas/venta/${venta.id}`, venta).pipe(
      tap(() => this.cache.invalidar(CACHE_KEY))
    );
  }

  completar(id: string): Observable<Venta> {
    return this.api.post<Venta>(`/ventas/venta/${id}/completar`, {}).pipe(
      tap(() => this.cache.invalidar(CACHE_KEY))
    );
  }

  anular(id: string): Observable<Venta> {
    return this.api.post<Venta>(`/ventas/venta/${id}/anular`, {}).pipe(
      tap(() => this.cache.invalidar(CACHE_KEY))
    );
  }

  obtenerComprobante(ventaId: string): Observable<Comprobante> {
    return this.api.get<Comprobante>(`/facturacion/comprobante/${ventaId}`);
  }

  cargar(estado?: string, desde?: Date, hasta?: Date): Observable<PageResponse<Venta>> {
    this.cargando.activar();
    let params = new HttpParams().set('size', String(PAGE_SIZE)).set('page', '0');
    if (estado) params = params.set('estado', estado);
    if (desde) params = params.set('desde', this.toLocalIso(desde));
    if (hasta) params = params.set('hasta', this.toLocalIso(hasta));

    return this.api.get<PageResponse<Venta>>('/ventas/venta/filtrar', params).pipe(
      tap((page) => {
        this.listaVentas.set(page.content);
        this.totalVentas.set(page.totalElements);
        this.cache.set(CACHE_KEY, page.content);
      }),
      finalize(() => this.cargando.inactivar())
    );
  }

  private toLocalIso(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
           `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  actualizarElGrid(item: Venta): void {
    this.listaVentas.update((list) =>
      list.map((v) => (v.id === item.id ? item : v))
    );
    this.cache.invalidar(CACHE_KEY);
  }

  agregarAlGrid(item: Venta): void {
    this.listaVentas.update((list) => [...list, item]);
    this.cache.invalidar(CACHE_KEY);
  }

  generarColumnasListado(): ColDef[] {
    return [
      { headerName: 'ID', field: 'id', hide: true },
      { headerName: 'Número', field: 'numero', width: 130, minWidth: 100 },
      { headerName: 'Fecha', field: 'fecha', width: 160, minWidth: 130 },
      { headerName: 'Estado', field: 'estado', width: 120, minWidth: 100 },
      { headerName: 'Forma Pago', field: 'formaPago', width: 130, minWidth: 100 },
      {
        headerName: 'Total',
        field: 'total',
        width: 120, minWidth: 100,
        type: 'numericColumn',
        valueFormatter: (params) => params.value != null ? `$${Number(params.value).toFixed(2)}` : '',
      },
      { headerName: 'Usuario', field: 'usuUsername', width: 150, minWidth: 120 },
      this.utilService.getColumnaAcciones(),
    ];
  }
}
