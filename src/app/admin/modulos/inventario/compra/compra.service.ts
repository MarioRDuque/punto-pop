import { inject, Injectable, signal } from '@angular/core';
import { finalize, Observable, tap } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ColDef } from 'ag-grid-community';
import { ApiService } from '../../../service/api.service';
import { CargandoService } from '../../../service/cargando.service';
import { CacheService } from '../../../service/cache.service';
import { UtilService } from '../../../service/util.service';
import { EstadoBadgeConfig, getInitials, renderAvatarBadge, renderStatusBadge } from '../../../service/ag-grid-badge.util';
import { Compra } from '../../../entities/Compra';
import { PageResponse } from '../../../entities/PageResponse';

const CACHE_KEY = 'compras';

const ESTADO_COMPRA_BADGE_CFG: Record<string, EstadoBadgeConfig> = {
  BORRADOR: { tone: 'warn',    label: 'Borrador' },
  RECIBIDA: { tone: 'success', label: 'Recibida' },
  ANULADA:  { tone: 'danger',  label: 'Anulada'  },
};

@Injectable({ providedIn: 'root' })
export class CompraService {

  private readonly api = inject(ApiService);
  private readonly cargando = inject(CargandoService);
  private readonly cache = inject(CacheService);
  private readonly utilService = inject(UtilService);

  readonly totalCompras = signal<number>(0);

  cargar(estado: string | undefined, page = 0, size = 20, q?: string): Observable<PageResponse<Compra>> {
    this.cargando.activar();
    let params = new HttpParams()
      .set('size', String(size))
      .set('sort', 'fecha,desc')
      .set('page', String(page));
    if (estado) params = params.set('estado', estado);
    if (q) params = params.set('q', q);
    return this.api.get<PageResponse<Compra>>('/inventario/compra/filtrar', params).pipe(
      tap((pageResp) => {
        this.totalCompras.set(pageResp.totalElements);
        this.cache.set(CACHE_KEY, pageResp.content);
      }),
      finalize(() => this.cargando.inactivar())
    );
  }

  guardar(compra: Compra): Observable<Compra> {
    return this.api.post<Compra>('/inventario/compra', compra).pipe(
      tap(() => this.cache.invalidar(CACHE_KEY))
    );
  }

  recibir(id: string): Observable<Compra> {
    return this.api.patch<Compra>(`/inventario/compra/${id}/recibir`, {}).pipe(
      tap(() => this.cache.invalidar(CACHE_KEY))
    );
  }

  anular(id: string): Observable<Compra> {
    return this.api.patch<Compra>(`/inventario/compra/${id}/anular`, {}).pipe(
      tap(() => this.cache.invalidar(CACHE_KEY))
    );
  }

  agregarAlGrid(_item: Compra): void {
    this.cache.invalidar(CACHE_KEY);
  }

  generarColumnasListado(
    onRecibir: (compra: Compra) => void,
    onAnular: (compra: Compra) => void,
  ): ColDef<Compra>[] {
    return [
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
        headerName: 'N°',
        field: 'numero',
        width: 110,
        cellStyle: { display: 'flex', alignItems: 'center', fontWeight: '600' },
      },
      {
        headerName: 'Fecha',
        field: 'fecha',
        width: 155,
        cellStyle: { display: 'flex', alignItems: 'center' },
        valueFormatter: (p) => p.value ? new Date(p.value).toLocaleString('es-EC') : '',
      },
      {
        headerName: 'Proveedor',
        field: 'proveedorNombre',
        flex: 1,
        minWidth: 160,
        cellStyle: { display: 'flex', alignItems: 'center' },
        cellRenderer: (params: { data: Compra }) => {
          const nombre = params.data?.proveedorNombre ?? '—';
          const initials = getInitials(nombre);
          return `<div style="display:flex;align-items:center;gap:8px">
            ${renderAvatarBadge(nombre, initials)}
            <span style="font-size:12px;font-weight:600">${nombre}</span>
          </div>`;
        },
      },
      {
        headerName: 'Total',
        field: 'total',
        width: 110,
        type: 'rightAligned',
        cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', fontWeight: '600' },
        valueFormatter: (p) => p.value != null ? `$${Number(p.value).toFixed(2)}` : '',
      },
      {
        headerName: 'Estado',
        field: 'estado',
        width: 120,
        cellStyle: { display: 'flex', alignItems: 'center' },
        cellRenderer: (params: { value: string }) => {
          return renderStatusBadge(params.value, ESTADO_COMPRA_BADGE_CFG, { dot: true });
        },
      },
      {
        colId: 'acciones',
        headerName: '',
        width: 160,
        sortable: false, filter: false, resizable: false,
        suppressHeaderMenuButton: true,
        cellStyle: { display: 'flex', alignItems: 'center', gap: '4px' },
        cellRenderer: (params: { data: Compra }) => {
          const estado = params.data?.estado;
          const wrap = document.createElement('div');
          wrap.style.cssText = 'display:flex;gap:4px;align-items:center;height:100%;padding:2px 0';
          if (estado === 'BORRADOR') {
            const btnR = document.createElement('button');
            btnR.textContent = 'Recibir';
            btnR.style.cssText = 'background:#22c55e;border:none;color:#fff;padding:2px 8px;border-radius:4px;cursor:pointer;font-size:11px;font-weight:600';
            btnR.onclick = () => onRecibir(params.data!);
            const btnA = document.createElement('button');
            btnA.textContent = 'Anular';
            btnA.style.cssText = 'background:#ef4444;border:none;color:#fff;padding:2px 8px;border-radius:4px;cursor:pointer;font-size:11px;font-weight:600';
            btnA.onclick = () => onAnular(params.data!);
            wrap.appendChild(btnR);
            wrap.appendChild(btnA);
          }
          return wrap;
        },
      },
    ];
  }
}
