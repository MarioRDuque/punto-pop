import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap, finalize, map } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ColDef } from 'ag-grid-enterprise';
import { ApiService } from '../../../service/api.service';
import { CargandoService } from '../../../service/cargando.service';
import { CacheService } from '../../../service/cache.service';
import { UtilService } from '../../../service/util.service';
import { getInitials, renderAvatarBadge } from '../../../service/ag-grid-badge.util';
import { CatProducto } from '../../../entities/CatProducto';
import { PageResponse } from '../../../entities/PageResponse';

const CACHE_KEY = 'productos';

@Injectable({ providedIn: 'root' })
export class ProductoService {

  private readonly api = inject(ApiService);
  private readonly cargando = inject(CargandoService);
  private readonly cache = inject(CacheService);
  private readonly utilService = inject(UtilService);

  readonly totalProductos = signal<number>(0);
  readonly listaProductos = signal<CatProducto[]>([]);

  guardar(producto: CatProducto): Observable<CatProducto> {
    return this.api.post<CatProducto>('/catalogo/producto', producto).pipe(
      tap(() => this.cache.invalidar(CACHE_KEY))
    );
  }

  actualizar(producto: CatProducto): Observable<CatProducto> {
    return this.api.put<CatProducto>(`/catalogo/producto/${producto.codigo}`, producto).pipe(
      tap(() => this.cache.invalidar(CACHE_KEY))
    );
  }

  eliminar(producto: CatProducto): Observable<CatProducto> {
    return this.api.delete<CatProducto>(`/catalogo/producto/${producto.codigo}`).pipe(
      tap(() => this.cache.invalidar(CACHE_KEY))
    );
  }

  cargar(filtro: string | undefined, page = 0, size = 20, q?: string): Observable<PageResponse<CatProducto>> {
    this.cargando.activar();
    let params = new HttpParams()
      .set('size', String(size))
      .set('page', String(page))
      .set('soloActivos', 'false');
    if (filtro) params = params.set('filtro', filtro);
    if (q) params = params.set('q', q);
    return this.api.get<PageResponse<CatProducto>>('/catalogo/producto/buscar', params).pipe(
      tap((pageResp) => {
        this.totalProductos.set(pageResp.totalElements);
        this.cache.set(CACHE_KEY, pageResp.content);
      }),
      finalize(() => this.cargando.inactivar())
    );
  }

  cargarTodos(): Observable<CatProducto[]> {
    return this.cargar(undefined, 0, 9999).pipe(
      tap(page => this.listaProductos.set(page.content)),
      map(page => page.content)
    );
  }

  agregarAlGrid(item: CatProducto): void {
    this.listaProductos.update(list => [...list, item]);
  }

  actualizarElGrid(item: CatProducto): void {
    this.listaProductos.update(list =>
      list.map(p => p.codigo === item.codigo ? item : p)
    );
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
        headerName: 'Producto',
        colId: 'producto',
        valueGetter: (p: { data: CatProducto }) => p.data?.nombre,
        flex: 2,
        minWidth: 220,
        cellStyle: { display: 'flex', alignItems: 'center' },
        cellRenderer: (params: { data: CatProducto }) => {
          const p       = params.data;
          const initials = getInitials(p.nombre);
          const sub     = [p.codigo, p.categoriaNombre].filter(Boolean).join(' · ');
          return `<div style="display:flex;align-items:center;gap:8px">
            ${renderAvatarBadge(p.nombre, initials)}
            <div style="display:flex;flex-direction:column;gap:1px">
              <span style="font-size:12px;font-weight:600;line-height:1.3">${p.nombre ?? ''}</span>
              <span style="font-size:10px;opacity:0.5;line-height:1.3">${sub}</span>
            </div>
          </div>`;
        },
      },
      { headerName: 'Código',    field: 'codigo',           hide: true },
      { headerName: 'Nombre',    field: 'nombre',           hide: true },
      { headerName: 'Categoría', field: 'categoriaNombre',  hide: true },
      { headerName: 'Unidad',    field: 'unidadMedidaNombre', hide: true },
      { headerName: 'IVA',       field: 'tarifaIvaDescripcion', hide: true },
      {
        headerName: 'Precio / Stock',
        colId: 'precioStock',
        valueGetter: (p: { data: CatProducto }) => p.data?.precioVenta,
        width: 150,
        minWidth: 130,
        cellStyle: { display: 'flex', alignItems: 'center' },
        cellRenderer: (params: { data: CatProducto }) => {
          const p     = params.data;
          const price = p.precioVenta != null ? `$${Number(p.precioVenta).toFixed(2)}` : '—';
          const stock = p.stock ?? 0;
          const unit  = p.unidadMedidaNombre ?? '';
          const stockColor = stock <= (p.stockMinimo ?? 0) ? '#ef4444' : 'inherit';
          return `<div style="display:flex;flex-direction:column;justify-content:center;gap:2px;font-size:11px;line-height:1.3">
            <span style="font-weight:600">${price}</span>
            <span style="opacity:0.5;color:${stockColor}">${stock} ${unit}</span>
          </div>`;
        },
      },
      { headerName: 'Precio Venta', field: 'precioVenta', hide: true },
      { headerName: 'Stock',        field: 'stock',       hide: true },
      this.utilService.getColumnaEstado('estado'),
      this.utilService.getColumnaAcciones(),
    ];
  }

}
