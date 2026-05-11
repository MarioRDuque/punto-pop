import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap, finalize } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ColDef } from 'ag-grid-enterprise';
import { ApiService } from '../../../service/api.service';
import { CargandoService } from '../../../service/cargando.service';
import { CacheService } from '../../../service/cache.service';
import { UtilService } from '../../../service/util.service';
import { VentaCliente } from '../../../entities/VentaCliente';
import { PageResponse } from '../../../entities/PageResponse';

const CACHE_KEY = 'clientes';

@Injectable({ providedIn: 'root' })
export class ClienteService {

  private readonly api = inject(ApiService);
  private readonly cargando = inject(CargandoService);
  private readonly cache = inject(CacheService);
  private readonly utilService = inject(UtilService);

  readonly listaClientes = signal<VentaCliente[]>([]);

  guardar(cliente: VentaCliente): Observable<VentaCliente> {
    return this.api.post<VentaCliente>('/ventas/cliente', cliente).pipe(
      tap(() => this.cache.invalidar(CACHE_KEY))
    );
  }

  actualizar(cliente: VentaCliente): Observable<VentaCliente> {
    return this.api.put<VentaCliente>(`/ventas/cliente/${cliente.id}`, cliente).pipe(
      tap(() => this.cache.invalidar(CACHE_KEY))
    );
  }

  eliminar(cliente: VentaCliente): Observable<VentaCliente> {
    return this.api.delete<VentaCliente>(`/ventas/cliente/${cliente.id}`).pipe(
      tap(() => this.cache.invalidar(CACHE_KEY))
    );
  }

  cargar(): Observable<PageResponse<VentaCliente>> {
    this.cargando.activar();
    const params = new HttpParams().set('size', '5000');
    return this.api.get<PageResponse<VentaCliente>>('/ventas/cliente', params).pipe(
      tap((page) => {
        this.listaClientes.set(page.content);
        this.cache.set(CACHE_KEY, page.content);
      }),
      finalize(() => this.cargando.inactivar())
    );
  }

  agregarAlGrid(item: VentaCliente): void {
    this.listaClientes.update((list) => [...list, item]);
    this.cache.invalidar(CACHE_KEY);
  }

  actualizarElGrid(item: VentaCliente): void {
    this.listaClientes.update((list) =>
      list.map((c) => (c.id === item.id ? item : c))
    );
    this.cache.invalidar(CACHE_KEY);
  }

  eliminarDelGrid(item: VentaCliente): void {
    this.listaClientes.update((list) =>
      list.filter((c) => c.id !== item.id)
    );
    this.cache.invalidar(CACHE_KEY);
  }

  generarColumnasListado(): ColDef[] {
    return [
      { headerName: 'ID', field: 'id', hide: true },
      { headerName: 'Tipo ID', field: 'tipoIdentificacion', width: 110, minWidth: 100 },
      { headerName: 'Identificación', field: 'identificacion', width: 150, minWidth: 120 },
      { headerName: 'Nombre', field: 'nombre', width: 200, minWidth: 150, flex: 1 },
      { headerName: 'Email', field: 'email', width: 200, minWidth: 150 },
      { headerName: 'Teléfono', field: 'telefono', width: 130, minWidth: 100 },
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
