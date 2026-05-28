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
      {
        headerName: '',
        checkboxSelection: true,
        headerCheckboxSelection: true,
        width: 44, minWidth: 44, maxWidth: 44,
        resizable: false, sortable: false, filter: false,
        suppressHeaderMenuButton: true,
        cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
      },
      {
        headerName: 'Venta',
        colId: 'venta',
        valueGetter: (p: { data: Venta }) => p.data?.numero,
        flex: 2,
        minWidth: 200,
        cellStyle: { display: 'flex', alignItems: 'center' },
        cellRenderer: (params: { data: Venta }) => {
          const v      = params.data;
          const num    = v.numero ?? '—';
          const client = v.clienteNombre ?? v.cliente?.nombre ?? '';
          const sub    = client || (v.usuEmail ?? '');
          return `<div style="display:flex;align-items:center;gap:8px">
            <div style="width:26px;height:26px;border-radius:6px;background:#5271df;display:flex;align-items:center;justify-content:center;color:#fff;font-size:8px;font-weight:700;flex-shrink:0">FV</div>
            <div style="display:flex;flex-direction:column;gap:1px">
              <span style="font-size:12px;font-weight:600;line-height:1.3;font-family:monospace">${num}</span>
              <span style="font-size:10px;opacity:0.5;line-height:1.3">${sub}</span>
            </div>
          </div>`;
        },
      },
      { headerName: 'Número',   field: 'numero',       hide: true },
      { headerName: 'Cliente',  field: 'clienteNombre', hide: true },
      { headerName: 'Usuario',  field: 'usuEmail',      hide: true },
      {
        headerName: 'Fecha',
        field: 'fecha',
        width: 150,
        minWidth: 120,
        cellStyle: { display: 'flex', alignItems: 'center' },
        cellRenderer: (params: { data: Venta }) => {
          const fecha = params.data?.fecha;
          if (!fecha) return `<span style="font-size:11px;opacity:0.4">—</span>`;
          const d = new Date(fecha);
          const fmt = d.toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' });
          return `<span style="font-size:11px">${fmt}</span>`;
        },
      },
      {
        headerName: 'Estado',
        colId: 'estadoVenta',
        field: 'estado',
        width: 130,
        minWidth: 110,
        cellStyle: { display: 'flex', alignItems: 'center' },
        cellRenderer: (params: { data: Venta }) => {
          const e = params.data?.estado ?? '';
          const map: Record<string, { bg: string; color: string; label: string }> = {
            PENDIENTE:  { bg: '#fef9c3', color: '#854d0e', label: 'Pendiente' },
            COMPLETADA: { bg: '#dcfce7', color: '#166534', label: 'Completada' },
            ANULADA:    { bg: '#fee2e2', color: '#991b1b', label: 'Anulada' },
          };
          const s = map[e] ?? { bg: 'var(--surface-border)', color: 'var(--text-color-secondary)', label: e };
          return `<span style="font-size:10px;font-weight:600;padding:2px 8px;border-radius:9999px;background:${s.bg};color:${s.color}">${s.label}</span>`;
        },
      },
      {
        headerName: 'Forma Pago',
        field: 'formaPago',
        width: 120,
        minWidth: 100,
        cellStyle: { display: 'flex', alignItems: 'center' },
        cellRenderer: (params: { data: Venta }) => {
          const f = params.data?.formaPago ?? '';
          return `<span style="font-size:11px">${f}</span>`;
        },
      },
      {
        headerName: 'Total',
        field: 'total',
        width: 110,
        minWidth: 90,
        type: 'numericColumn',
        cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end' },
        cellRenderer: (params: { data: Venta }) => {
          const t = params.data?.total;
          return t != null
            ? `<span style="font-size:12px;font-weight:700">${'$' + Number(t).toFixed(2)}</span>`
            : `<span style="opacity:0.4">—</span>`;
        },
      },
      this.utilService.getColumnaAcciones(),
    ];
  }
}
