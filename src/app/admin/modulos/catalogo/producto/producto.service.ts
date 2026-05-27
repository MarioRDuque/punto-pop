import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap, finalize } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ColDef } from 'ag-grid-enterprise';
import { ApiService } from '../../../service/api.service';
import { CargandoService } from '../../../service/cargando.service';
import { CacheService } from '../../../service/cache.service';
import { UtilService } from '../../../service/util.service';
import { CatProducto } from '../../../entities/CatProducto';
import { PageResponse } from '../../../entities/PageResponse';

const CACHE_KEY = 'productos';

@Injectable({ providedIn: 'root' })
export class ProductoService {

  private readonly api = inject(ApiService);
  private readonly cargando = inject(CargandoService);
  private readonly cache = inject(CacheService);
  private readonly utilService = inject(UtilService);

  readonly listaProductos = signal<CatProducto[]>([]);

  guardar(producto: CatProducto): Observable<CatProducto> {
    return this.api.post<CatProducto>('/catalogo/producto', producto).pipe(
      tap(() => this.cache.invalidar(CACHE_KEY))
    );
  }

  actualizar(producto: CatProducto): Observable<CatProducto> {
    return this.api.put<CatProducto>(`/catalogo/producto/${producto.id}`, producto).pipe(
      tap(() => this.cache.invalidar(CACHE_KEY))
    );
  }

  eliminar(producto: CatProducto): Observable<CatProducto> {
    return this.api.delete<CatProducto>(`/catalogo/producto/${producto.id}`).pipe(
      tap(() => this.cache.invalidar(CACHE_KEY))
    );
  }

  cargar(): Observable<PageResponse<CatProducto>> {
    this.cargando.activar();
    const params = new HttpParams()
      .set('size', '1000')
      .set('soloActivos', 'false');
    return this.api.get<PageResponse<CatProducto>>('/catalogo/producto/buscar', params).pipe(
      tap((page) => {
        this.listaProductos.set(page.content);
        this.cache.set(CACHE_KEY, page.content);
      }),
      finalize(() => this.cargando.inactivar())
    );
  }

  agregarAlGrid(item: CatProducto): void {
    this.listaProductos.update((list) => [...list, item]);
    this.cache.invalidar(CACHE_KEY);
  }

  actualizarElGrid(item: CatProducto): void {
    this.listaProductos.update((list) =>
      list.map((p) => (p.id === item.id ? item : p))
    );
    this.cache.invalidar(CACHE_KEY);
  }

  eliminarDelGrid(item: CatProducto): void {
    this.listaProductos.update((list) =>
      list.filter((p) => p.id !== item.id)
    );
    this.cache.invalidar(CACHE_KEY);
  }

  generarColumnasListado(): ColDef[] {
    return [
      { headerName: 'ID', field: 'id', hide: true },
      { headerName: 'Código', field: 'codigo', width: 120, minWidth: 100 },
      { headerName: 'Nombre', field: 'nombre', width: 200, minWidth: 150 },
      { headerName: 'Categoría', field: 'categoriaNombre', width: 160, minWidth: 120 },
      { headerName: 'Unidad', field: 'unidadMedidaNombre', width: 120, minWidth: 100 },
      { headerName: 'IVA', field: 'tarifaIvaDescripcion', width: 110, minWidth: 90 },
      {
        headerName: 'Precio Venta',
        field: 'precioVenta',
        width: 130, minWidth: 100,
        type: 'numericColumn',
        valueFormatter: (params) => params.value != null ? `$${Number(params.value).toFixed(2)}` : '',
      },
      {
        headerName: 'Stock',
        field: 'stock',
        width: 100, minWidth: 80,
        type: 'numericColumn',
      },
      {
        ...this.utilService.getColumnaEstado('estado'),
        width: 100, minWidth: 100, maxWidth: 100,
        cellStyle: { textAlign: 'center' },
      },
      this.utilService.getColumnaAcciones(),
    ];
  }
}
