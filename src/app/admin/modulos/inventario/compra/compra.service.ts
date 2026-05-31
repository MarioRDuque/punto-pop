import { inject, Injectable, signal } from '@angular/core';
import { finalize, Observable, tap } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ColDef } from 'ag-grid-community';
import { ApiService } from '../../../service/api.service';
import { CargandoService } from '../../../service/cargando.service';
import { CacheService } from '../../../service/cache.service';
import { UtilService } from '../../../service/util.service';
import { Compra } from '../../../entities/Compra';
import { PageResponse } from '../../../entities/PageResponse';

const CACHE_KEY = 'compras';

@Injectable({ providedIn: 'root' })
export class CompraService {

  private readonly api = inject(ApiService);
  private readonly cargando = inject(CargandoService);
  private readonly cache = inject(CacheService);
  private readonly utilService = inject(UtilService);

  readonly listaCompras = signal<Compra[]>([]);

  cargar(): Observable<PageResponse<Compra>> {
    this.cargando.activar();
    const params = new HttpParams().set('size', '500').set('sort', 'fecha,desc');
    return this.api.get<PageResponse<Compra>>('/inventario/compra/filtrar', params).pipe(
      tap((page) => {
        this.listaCompras.set(page.content);
        this.cache.set(CACHE_KEY, page.content);
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

  agregarAlGrid(item: Compra): void {
    this.listaCompras.update((list) => [item, ...list]);
    this.cache.invalidar(CACHE_KEY);
  }

  actualizarElGrid(item: Compra): void {
    this.listaCompras.update((list) =>
      list.map((c) => (c.id === item.id ? item : c))
    );
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
          const initials = nombre.split(' ').slice(0, 2).map((w: string) => w[0] ?? '').join('').toUpperCase();
          return `<div style="display:flex;align-items:center;gap:8px">
            <div style="width:26px;height:26px;border-radius:6px;background:#6366f1;display:flex;align-items:center;justify-content:center;color:#fff;font-size:9px;font-weight:700;flex-shrink:0">${initials}</div>
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
          const cfg: Record<string, { bg: string; dot: string; text: string; label: string }> = {
            BORRADOR:  { bg: '#fef9c3', dot: '#ca8a04', text: '#854d0e', label: 'Borrador' },
            RECIBIDA:  { bg: '#dcfce7', dot: '#16a34a', text: '#15803d', label: 'Recibida' },
            ANULADA:   { bg: '#fee2e2', dot: '#dc2626', text: '#991b1b', label: 'Anulada'  },
          };
          const c = cfg[params.value] ?? { bg: '#f3f4f6', dot: '#9ca3af', text: '#6b7280', label: params.value };
          return `<span style="display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:9999px;background:${c.bg};font-size:11px;font-weight:500;color:${c.text};line-height:1">
            <span style="width:6px;height:6px;border-radius:50%;background:${c.dot};flex-shrink:0"></span>
            ${c.label}
          </span>`;
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
