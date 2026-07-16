import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap, finalize } from 'rxjs';
import { ApiService } from '../../../service/api.service';
import { ConfRol } from '../../../entities/ConfRol';
import { CargandoService } from '../../../service/cargando.service';
import { CacheService } from '../../../service/cache.service';
import { ColDef } from 'ag-grid-enterprise';
import { TipoFiltro } from '../../../enums/tipo-filtro';
import { HttpParams } from '@angular/common/http';
import { UtilService } from '../../../service/util.service';
import { renderAvatarBadge } from '../../../service/ag-grid-badge.util';

const CACHE_KEY = 'roles';

@Injectable({ providedIn: 'root' })
export class RolService {

  private readonly api = inject(ApiService);
  private readonly cargando = inject(CargandoService);
  private readonly cache = inject(CacheService);
  private readonly utilService = inject(UtilService);

  readonly listaRoles = signal<ConfRol[]>([]);

  listarRol(): Observable<ConfRol[]> {
    return this.api.get<ConfRol[]>('/configuracion/rol');
  }

  guardar(rol: ConfRol): Observable<ConfRol> {
    return this.api.post<ConfRol>('/configuracion/rol', rol).pipe(
      tap(() => this.cache.invalidar(CACHE_KEY))
    );
  }

  actualizar(rol: ConfRol): Observable<ConfRol> {
    return this.api.put<ConfRol>(`/configuracion/rol/${rol.rolCodigo}`, rol).pipe(
      tap(() => this.cache.invalidar(CACHE_KEY))
    );
  }

  eliminar(rol: ConfRol): Observable<ConfRol> {
    return this.api.delete<ConfRol>(`/configuracion/rol/${rol.rolCodigo}`).pipe(
      tap(() => this.cache.invalidar(CACHE_KEY))
    );
  }

  cargar(filtro?: TipoFiltro, q?: string): Observable<ConfRol[]> {
    this.cargando.activar();
    let params = new HttpParams();
    if (filtro) params = params.set('filtro', filtro);
    if (q?.trim()) params = params.set('q', q.trim());

    return this.api.get<ConfRol[]>('/configuracion/rol/filtrar', params).pipe(
      tap((data) => {
        this.listaRoles.set(data);
        this.cache.set(CACHE_KEY, data);
      }),
      finalize(() => this.cargando.inactivar())
    );
  }

  agregarAlGrid(rol: ConfRol): void {
    this.listaRoles.update((list) => [...list, rol]);
    this.cache.invalidar(CACHE_KEY);
  }

  actualizarElGrid(rol: ConfRol): void {
    this.listaRoles.update((list) =>
      list.map((r) => (r.rolCodigo === rol.rolCodigo ? rol : r))
    );
    this.cache.invalidar(CACHE_KEY);
  }

  eliminarDelGrid(rol: ConfRol): void {
    this.listaRoles.update((list) =>
      list.filter((r) => r.rolCodigo !== rol.rolCodigo)
    );
    this.cache.invalidar(CACHE_KEY);
  }

  generarColumnasListado(): ColDef[] {
    return [
      { headerName: 'ID', field: 'rolCodigo', hide: true },
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
        headerName: 'Rol',
        colId: 'rol',
        valueGetter: (p: { data: ConfRol }) => p.data?.rolDescripcion,
        flex: 2,
        minWidth: 200,
        cellStyle: { display: 'flex', alignItems: 'center' },
        cellRenderer: (params: { data: ConfRol }) => {
          const r     = params.data;
          const code  = (r.rolCodigo ?? '').substring(0, 3).toUpperCase();
          return `<div style="display:flex;align-items:center;gap:8px">
            ${renderAvatarBadge(r.rolCodigo, code)}
            <div style="display:flex;flex-direction:column;gap:1px">
              <span style="font-size:12px;font-weight:600;line-height:1.3">${r.rolDescripcion ?? ''}</span>
              <span style="font-size:10px;opacity:0.5;line-height:1.3;font-family:monospace">${r.rolCodigo ?? ''}</span>
            </div>
          </div>`;
        },
      },
      { headerName: 'Código',      field: 'rolCodigo',      hide: true },
      { headerName: 'Descripción', field: 'rolDescripcion',  hide: true },
      {
        headerName: 'Permisos',
        colId: 'permisos',
        valueGetter: (p: { data: ConfRol }) => p.data?.permisos?.length ?? 0,
        width: 120,
        minWidth: 100,
        cellStyle: { display: 'flex', alignItems: 'center' },
        cellRenderer: (params: { data: ConfRol }) => {
          const count = params.data?.permisos?.length ?? 0;
          const color = count > 0 ? 'var(--primary-color)' : 'var(--text-color-secondary)';
          return `<span style="font-size:11px;font-weight:600;color:${color}">${count} permiso${count !== 1 ? 's' : ''}</span>`;
        },
      },
      this.utilService.getColumnaEstado('rolEstado'),
      this.utilService.getColumnaAcciones(),
    ];
  }

}
