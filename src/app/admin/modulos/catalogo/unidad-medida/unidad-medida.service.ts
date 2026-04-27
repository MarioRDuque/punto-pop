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
      { headerName: 'Código', field: 'codigo', width: 120, minWidth: 120 },
      { headerName: 'Nombre', field: 'nombre', width: 180, minWidth: 150 },
      { headerName: 'Abreviatura', field: 'abreviatura', width: 130, minWidth: 100 },
      {
        headerName: 'Estado',
        field: 'estado',
        cellRenderer: 'agCheckboxCellRenderer',
        cellRendererParams: { disabled: true },
        width: 100, minWidth: 100, maxWidth: 100,
        cellStyle: { textAlign: 'center' },
      },
      this.utilService.getColumnaAcciones(),
    ];
  }
}
