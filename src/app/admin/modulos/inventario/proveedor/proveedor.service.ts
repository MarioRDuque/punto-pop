import { inject, Injectable, signal } from '@angular/core';
import { finalize, Observable, tap, map } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ColDef } from 'ag-grid-enterprise';
import { ApiService } from '../../../service/api.service';
import { CargandoService } from '../../../service/cargando.service';
import { CacheService } from '../../../service/cache.service';
import { UtilService } from '../../../service/util.service';
import { getInitials, renderAvatarBadge } from '../../../service/ag-grid-badge.util';
import { Proveedor } from '../../../entities/Proveedor';
import { PageResponse } from '../../../entities/PageResponse';

const CACHE_KEY = 'proveedores';

@Injectable({ providedIn: 'root' })
export class ProveedorService {

  private readonly api = inject(ApiService);
  private readonly cargando = inject(CargandoService);
  private readonly cache = inject(CacheService);
  private readonly utilService = inject(UtilService);

  readonly listaProveedores = signal<Proveedor[]>([]);

  cargar(estado: string | undefined, page = 0, size = 20, q?: string): Observable<PageResponse<Proveedor>> {
    this.cargando.activar();
    let params = new HttpParams()
      .set('size', String(size))
      .set('page', String(page));
    if (estado) params = params.set('estado', estado);
    if (q) params = params.set('q', q);
    return this.api.get<PageResponse<Proveedor>>('/inventario/proveedor/filtrar', params).pipe(
      tap((data) => this.cache.set(CACHE_KEY, data.content)),
      finalize(() => this.cargando.inactivar())
    );
  }

  cargarTodos(): Observable<Proveedor[]> {
    return this.cargar(undefined, 0, 9999).pipe(
      tap(page => this.listaProveedores.set(page.content)),
      map(page => page.content)
    );
  }

  agregarAlGrid(item: Proveedor): void {
    this.listaProveedores.update(list => [...list, item]);
  }

  actualizarElGrid(item: Proveedor): void {
    this.listaProveedores.update(list =>
      list.map(p => p.ruc === item.ruc ? item : p)
    );
  }

  guardar(proveedor: Proveedor): Observable<Proveedor> {
    return this.api.post<Proveedor>('/inventario/proveedor', proveedor).pipe(
      tap(() => this.cache.invalidar(CACHE_KEY))
    );
  }

  actualizar(proveedor: Proveedor): Observable<Proveedor> {
    return this.api.put<Proveedor>(`/inventario/proveedor/${proveedor.ruc}`, proveedor).pipe(
      tap(() => this.cache.invalidar(CACHE_KEY))
    );
  }

  eliminar(proveedor: Proveedor): Observable<void> {
    return this.api.delete<void>(`/inventario/proveedor/${proveedor.ruc}`).pipe(
      tap(() => this.cache.invalidar(CACHE_KEY))
    );
  }

  generarColumnasListado(): ColDef[] {
    return [
      { headerName: 'RUC', field: 'ruc', hide: true },
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
        headerName: 'Empresa',
        colId: 'empresa',
        valueGetter: (p: { data: Proveedor }) => p.data?.razonSocial,
        flex: 2,
        minWidth: 220,
        cellStyle: { display: 'flex', alignItems: 'center' },
        cellRenderer: (params: { data: Proveedor }) => {
          const p = params.data;
          const initials = getInitials(p.razonSocial);
          const sub      = p.nombreComercial
            ? `${p.nombreComercial} · ${p.ruc}`
            : p.ruc ?? '';
          return `<div style="display:flex;align-items:center;gap:8px">
            ${renderAvatarBadge(p.razonSocial, initials)}
            <div style="display:flex;flex-direction:column;gap:1px">
              <span style="font-size:12px;font-weight:600;line-height:1.3">${p.razonSocial ?? ''}</span>
              <span style="font-size:10px;opacity:0.5;line-height:1.3">${sub}</span>
            </div>
          </div>`;
        },
      },
      { headerName: 'RUC',              field: 'ruc',             hide: true },
      { headerName: 'Razón Social',     field: 'razonSocial',     hide: true },
      { headerName: 'Nombre Comercial', field: 'nombreComercial', hide: true },
      {
        headerName: 'Contacto',
        colId: 'contacto',
        valueGetter: (p: { data: Proveedor }) => p.data?.email,
        flex: 2,
        minWidth: 180,
        cellStyle: { display: 'flex', alignItems: 'center' },
        cellRenderer: (params: { data: Proveedor }) => {
          const p  = params.data;
          const em = p.email
            ? `<span style="display:flex;align-items:center;gap:4px"><i class="pi pi-envelope" style="font-size:8px;opacity:0.4"></i>${p.email}</span>`
            : `<span style="display:flex;align-items:center;gap:4px;opacity:0.4;font-style:italic"><i class="pi pi-envelope" style="font-size:8px"></i>— sin email</span>`;
          const ph = p.telefono
            ? `<span style="display:flex;align-items:center;gap:4px"><i class="pi pi-phone" style="font-size:8px;opacity:0.4"></i>${p.telefono}</span>`
            : `<span style="display:flex;align-items:center;gap:4px;opacity:0.4;font-style:italic"><i class="pi pi-phone" style="font-size:8px"></i>— sin teléfono</span>`;
          return `<div style="display:flex;flex-direction:column;justify-content:center;gap:2px;font-size:11px;line-height:1.3">${em}${ph}</div>`;
        },
      },
      { headerName: 'Email',    field: 'email',    hide: true },
      { headerName: 'Teléfono', field: 'telefono', hide: true },
      this.utilService.getColumnaEstado('estado'),
      this.utilService.getColumnaAcciones(),
    ];
  }

}
