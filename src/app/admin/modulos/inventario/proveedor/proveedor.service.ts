import { inject, Injectable, signal } from '@angular/core';
import { finalize, Observable, tap } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ColDef } from 'ag-grid-enterprise';
import { ApiService } from '../../../service/api.service';
import { CargandoService } from '../../../service/cargando.service';
import { CacheService } from '../../../service/cache.service';
import { UtilService } from '../../../service/util.service';
import { Proveedor } from '../../../entities/Proveedor';

const CACHE_KEY = 'proveedores';

@Injectable({ providedIn: 'root' })
export class ProveedorService {

  private readonly api = inject(ApiService);
  private readonly cargando = inject(CargandoService);
  private readonly cache = inject(CacheService);
  private readonly utilService = inject(UtilService);

  readonly listaProveedores = signal<Proveedor[]>([]);

  cargar(q?: string): Observable<Proveedor[]> {
    this.cargando.activar();
    let params = new HttpParams();
    if (q?.trim()) params = params.set('q', q.trim());
    return this.api.get<Proveedor[]>('/inventario/proveedor/filtrar', params).pipe(
      tap((data) => {
        this.listaProveedores.set(data);
        this.cache.set(CACHE_KEY, data);
      }),
      finalize(() => this.cargando.inactivar())
    );
  }

  guardar(proveedor: Proveedor): Observable<Proveedor> {
    return this.api.post<Proveedor>('/inventario/proveedor', proveedor).pipe(
      tap(() => this.cache.invalidar(CACHE_KEY))
    );
  }

  actualizar(proveedor: Proveedor): Observable<Proveedor> {
    return this.api.put<Proveedor>(`/inventario/proveedor/${proveedor.id}`, proveedor).pipe(
      tap(() => this.cache.invalidar(CACHE_KEY))
    );
  }

  eliminar(proveedor: Proveedor): Observable<void> {
    return this.api.delete<void>(`/inventario/proveedor/${proveedor.id}`).pipe(
      tap(() => this.cache.invalidar(CACHE_KEY))
    );
  }

  agregarAlGrid(item: Proveedor): void {
    this.listaProveedores.update((list) => [...list, item]);
    this.cache.invalidar(CACHE_KEY);
  }

  actualizarElGrid(item: Proveedor): void {
    this.listaProveedores.update((list) =>
      list.map((p) => (p.id === item.id ? item : p))
    );
    this.cache.invalidar(CACHE_KEY);
  }

  eliminarDelGrid(item: Proveedor): void {
    this.listaProveedores.update((list) => list.filter((p) => p.id !== item.id));
    this.cache.invalidar(CACHE_KEY);
  }

  generarColumnasListado(): ColDef[] {
    return [
      { headerName: 'RUC',              field: 'ruc',             width: 130 },
      { headerName: 'Razón Social',     field: 'razonSocial',     flex: 1, minWidth: 180 },
      { headerName: 'Nombre Comercial', field: 'nombreComercial', width: 180 },
      { headerName: 'Teléfono',         field: 'telefono',        width: 120 },
      { headerName: 'Email',            field: 'email',           width: 200 },
      {
        headerName: 'Estado',
        field: 'estado',
        cellRenderer: 'agCheckboxCellRenderer',
        cellRendererParams: { disabled: true },
        width: 90, maxWidth: 90,
        cellStyle: { textAlign: 'center' },
      },
      this.utilService.getColumnaAcciones(),
    ];
  }
}
