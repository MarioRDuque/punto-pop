import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap, finalize } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ColDef } from 'ag-grid-enterprise';
import { ApiService } from '../../../service/api.service';
import { CargandoService } from '../../../service/cargando.service';
import { CacheService } from '../../../service/cache.service';
import { UtilService } from '../../../service/util.service';
import { getInitials, renderAvatarBadge } from '../../../service/ag-grid-badge.util';
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
    return this.api.put<CatCategoria>(`/catalogo/categoria/${categoria.codigo}`, categoria).pipe(
      tap(() => this.cache.invalidar(CACHE_KEY))
    );
  }

  eliminar(categoria: CatCategoria): Observable<CatCategoria> {
    return this.api.delete<CatCategoria>(`/catalogo/categoria/${categoria.codigo}`).pipe(
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
      list.map((c) => (c.codigo === item.codigo ? item : c))
    );
    this.cache.invalidar(CACHE_KEY);
  }

  eliminarDelGrid(item: CatCategoria): void {
    this.listaCategorias.update((list) =>
      list.filter((c) => c.codigo !== item.codigo)
    );
    this.cache.invalidar(CACHE_KEY);
  }

  generarColumnasListado(): ColDef[] {
    return [
      { headerName: 'Código', field: 'codigo', hide: true },
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
        headerName: 'Categoría',
        colId: 'categoria',
        valueGetter: (p: { data: CatCategoria }) => p.data?.nombre,
        flex: 2,
        minWidth: 200,
        cellStyle: { display: 'flex', alignItems: 'center' },
        cellRenderer: (params: { data: CatCategoria }) => {
          const c       = params.data;
          const initials = getInitials(c.nombre);
          return `<div style="display:flex;align-items:center;gap:8px">
            ${renderAvatarBadge(c.nombre, initials)}
            <div style="display:flex;flex-direction:column;gap:1px">
              <span style="font-size:12px;font-weight:600;line-height:1.3">${c.nombre ?? ''}</span>
              <span style="font-size:10px;opacity:0.5;line-height:1.3;font-family:monospace">${c.codigo ?? ''}</span>
            </div>
          </div>`;
        },
      },
      { headerName: 'Código', field: 'codigo', hide: true },
      { headerName: 'Nombre', field: 'nombre', hide: true },
      {
        headerName: 'Descripción',
        colId: 'descripcion',
        valueGetter: (p: { data: CatCategoria }) => p.data?.descripcion,
        flex: 2,
        minWidth: 160,
        cellStyle: { display: 'flex', alignItems: 'center' },
        cellRenderer: (params: { data: CatCategoria }) => {
          const desc = params.data?.descripcion;
          return desc
            ? `<span style="font-size:11px;line-height:1.4">${desc}</span>`
            : `<span style="font-size:11px;opacity:0.4;font-style:italic">— sin descripción</span>`;
        },
      },
      { headerName: 'Descripción export', field: 'descripcion', hide: true },
      this.utilService.getColumnaEstado('estado'),
      this.utilService.getColumnaAcciones(),
    ];
  }

}
