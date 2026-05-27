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
      { headerName: 'Código',      field: 'rolCodigo',      width: 120, minWidth: 120 },
      { headerName: 'Descripción', field: 'rolDescripcion',  width: 120, minWidth: 120 },
      {
        ...this.utilService.getColumnaEstado('rolEstado'),
        width: 100, minWidth: 100, maxWidth: 100,
        cellStyle: { textAlign: 'center' },
      },
      this.utilService.getColumnaAcciones(),
    ];
  }
}
