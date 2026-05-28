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
          const initials = this.getInitials(p.nombre);
          const color   = this.getAvatarColor(p.nombre);
          const sub     = [p.codigo, p.categoriaNombre].filter(Boolean).join(' · ');
          return `<div style="display:flex;align-items:center;gap:8px">
            <div style="width:26px;height:26px;border-radius:6px;background:${color};display:flex;align-items:center;justify-content:center;color:#fff;font-size:9px;font-weight:700;flex-shrink:0">${initials}</div>
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

  private getInitials(nombre: string): string {
    const parts = (nombre ?? '').trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return (nombre ?? '??').substring(0, 2).toUpperCase();
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
