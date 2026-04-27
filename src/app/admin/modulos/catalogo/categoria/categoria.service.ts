import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap, finalize } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ColDef } from 'ag-grid-enterprise';
import { ApiService } from '../../../service/api.service';
import { CargandoService } from '../../../service/cargando.service';
import { CacheService } from '../../../service/cache.service';
import { UtilService } from '../../../service/util.service';
import { CatCategoria } from '../../../entities/CatCategoria';
import { PageResponse } from '../../../entities/PageResponse';

const CACHE_KEY = 'categorias';

@Injectable({ providedIn: 'root' })
export class CategoriaService {

  private readonly api = inject(ApiService);
  private readonly cargando = inject(CargandoService);
  private readonly cache = inject(CacheService);
  private readonly utilService = inject(UtilService);

  readonly listaCategorias = signal<CatCategoria[]>([]);

  guardar(categoria: CatCategoria): Observable<CatCategoria> {
    return this.api.post<CatCategoria>('/catalogo/categoria', categoria).pipe(
      tap(() => this.cache.invalidar(CACHE_KEY))
    );
  }

  actualizar(categoria: CatCategoria): Observable<CatCategoria> {
    return this.api.put<CatCategoria>(`/catalogo/categoria/${categoria.id}`, categoria).pipe(
      tap(() => this.cache.invalidar(CACHE_KEY))
    );
  }

  eliminar(categoria: CatCategoria): Observable<CatCategoria> {
    return this.api.delete<CatCategoria>(`/catalogo/categoria/${categoria.id}`).pipe(
      tap(() => this.cache.invalidar(CACHE_KEY))
    );
  }

  cargar(): Observable<PageResponse<CatCategoria>> {
    this.cargando.activar();
    const params = new HttpParams().set('size', '1000');
    return this.api.get<PageResponse<CatCategoria>>('/catalogo/categoria', params).pipe(
      tap((page) => {
        this.listaCategorias.set(page.content);
        this.cache.set(CACHE_KEY, page.content);
      }),
      finalize(() => this.cargando.inactivar())
    );
  }

  agregarAlGrid(item: CatCategoria): void {
    this.listaCategorias.update((list) => [...list, item]);
    this.cache.invalidar(CACHE_KEY);
  }

  actualizarElGrid(item: CatCategoria): void {
    this.listaCategorias.update((list) =>
      list.map((c) => (c.id === item.id ? item : c))
    );
    this.cache.invalidar(CACHE_KEY);
  }

  eliminarDelGrid(item: CatCategoria): void {
    this.listaCategorias.update((list) =>
      list.filter((c) => c.id !== item.id)
    );
    this.cache.invalidar(CACHE_KEY);
  }

  generarColumnasListado(): ColDef[] {
    return [
      { headerName: 'ID', field: 'id', hide: true },
      { headerName: 'Código', field: 'codigo', width: 120, minWidth: 120 },
      { headerName: 'Nombre', field: 'nombre', width: 180, minWidth: 150 },
      { headerName: 'Descripción', field: 'descripcion', width: 220, minWidth: 150, flex: 1 },
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
