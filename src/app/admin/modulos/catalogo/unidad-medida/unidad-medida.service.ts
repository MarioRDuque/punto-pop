import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap, finalize } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ColDef } from 'ag-grid-enterprise';
import { ApiService } from '../../../service/api.service';
import { CargandoService } from '../../../service/cargando.service';
import { CacheService } from '../../../service/cache.service';
import { UtilService } from '../../../service/util.service';
import { CatUnidadMedida } from '../../../entities/CatUnidadMedida';
import { PageResponse } from '../../../entities/PageResponse';

const CACHE_KEY = 'unidades';

@Injectable({ providedIn: 'root' })
export class UnidadMedidaService {

  private readonly api = inject(ApiService);
  private readonly cargando = inject(CargandoService);
  private readonly cache = inject(CacheService);
  private readonly utilService = inject(UtilService);

  readonly listaUnidades = signal<CatUnidadMedida[]>([]);

  guardar(unidad: CatUnidadMedida): Observable<CatUnidadMedida> {
    return this.api.post<CatUnidadMedida>('/catalogo/unidad-medida', unidad).pipe(
      tap(() => this.cache.invalidar(CACHE_KEY))
    );
  }

  actualizar(unidad: CatUnidadMedida): Observable<CatUnidadMedida> {
    return this.api.put<CatUnidadMedida>(`/catalogo/unidad-medida/${unidad.id}`, unidad).pipe(
      tap(() => this.cache.invalidar(CACHE_KEY))
    );
  }

  eliminar(unidad: CatUnidadMedida): Observable<CatUnidadMedida> {
    return this.api.delete<CatUnidadMedida>(`/catalogo/unidad-medida/${unidad.id}`).pipe(
      tap(() => this.cache.invalidar(CACHE_KEY))
    );
  }

  cargar(): Observable<PageResponse<CatUnidadMedida>> {
    this.cargando.activar();
    const params = new HttpParams().set('size', '1000');
    return this.api.get<PageResponse<CatUnidadMedida>>('/catalogo/unidad-medida', params).pipe(
      tap((page) => {
        this.listaUnidades.set(page.content);
        this.cache.set(CACHE_KEY, page.content);
      }),
      finalize(() => this.cargando.inactivar())
    );
  }

  agregarAlGrid(item: CatUnidadMedida): void {
    this.listaUnidades.update((list) => [...list, item]);
    this.cache.invalidar(CACHE_KEY);
  }

  actualizarElGrid(item: CatUnidadMedida): void {
    this.listaUnidades.update((list) =>
      list.map((u) => (u.id === item.id ? item : u))
    );
    this.cache.invalidar(CACHE_KEY);
  }

  eliminarDelGrid(item: CatUnidadMedida): void {
    this.listaUnidades.update((list) =>
      list.filter((u) => u.id !== item.id)
    );
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
        headerName: 'Unidad de medida',
        colId: 'unidad',
        valueGetter: (p: { data: CatUnidadMedida }) => p.data?.nombre,
        flex: 2,
        minWidth: 200,
        cellStyle: { display: 'flex', alignItems: 'center' },
        cellRenderer: (params: { data: CatUnidadMedida }) => {
          const u     = params.data;
          const abbr  = (u.abreviatura ?? '').substring(0, 3).toUpperCase() || '—';
          const color = this.getAvatarColor(u.nombre);
          return `<div style="display:flex;align-items:center;gap:8px">
            <div style="width:26px;height:26px;border-radius:6px;background:${color};display:flex;align-items:center;justify-content:center;color:#fff;font-size:9px;font-weight:700;flex-shrink:0;letter-spacing:.3px">${abbr}</div>
            <div style="display:flex;flex-direction:column;gap:1px">
              <span style="font-size:12px;font-weight:600;line-height:1.3">${u.nombre ?? ''}</span>
              <span style="font-size:10px;opacity:0.5;line-height:1.3;font-family:monospace">${u.codigo ?? ''}</span>
            </div>
          </div>`;
        },
      },
      { headerName: 'Código',      field: 'codigo',      hide: true },
      { headerName: 'Nombre',      field: 'nombre',      hide: true },
      { headerName: 'Abreviatura', field: 'abreviatura', hide: true },
      this.utilService.getColumnaEstado('estado'),
      this.utilService.getColumnaAcciones(),
    ];
  }

  private readonly avatarColors = [
    '#5271df', '#3ea882', '#e0834e', '#9b6dd4', '#3a9fc4',
    '#d4646e', '#4aab8e', '#c47f3a', '#6b7fd4', '#5aa87b',
    '#c45c8c', '#4d98c4',
  ];

  private getAvatarColor(key: string): string {
    const str = key ?? '';
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = (Math.imul(h, 0x01000193)) >>> 0;
    }
    return this.avatarColors[h % this.avatarColors.length];
  }
}
