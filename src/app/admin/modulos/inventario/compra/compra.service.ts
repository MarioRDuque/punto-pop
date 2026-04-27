import { inject, Injectable, signal } from '@angular/core';
import { finalize, Observable, tap } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ApiService } from '../../../service/api.service';
import { CargandoService } from '../../../service/cargando.service';
import { CacheService } from '../../../service/cache.service';
import { Compra } from '../../../entities/Compra';
import { PageResponse } from '../../../entities/PageResponse';

const CACHE_KEY = 'compras';

@Injectable({ providedIn: 'root' })
export class CompraService {

  private readonly api = inject(ApiService);
  private readonly cargando = inject(CargandoService);
  private readonly cache = inject(CacheService);

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
}
