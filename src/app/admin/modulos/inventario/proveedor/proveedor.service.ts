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
        headerName: 'Empresa',
        colId: 'empresa',
        valueGetter: (p: { data: Proveedor }) => p.data?.razonSocial,
        flex: 2,
        minWidth: 220,
        cellStyle: { display: 'flex', alignItems: 'center' },
        cellRenderer: (params: { data: Proveedor }) => {
          const p = params.data;
          const initials = this.getInitials(p.razonSocial);
          const color    = this.getAvatarColor(p.razonSocial);
          const sub      = p.nombreComercial
            ? `${p.nombreComercial} · ${p.ruc}`
            : p.ruc ?? '';
          return `<div style="display:flex;align-items:center;gap:8px">
            <div style="width:26px;height:26px;border-radius:6px;background:${color};display:flex;align-items:center;justify-content:center;color:#fff;font-size:9px;font-weight:700;flex-shrink:0">${initials}</div>
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

  private getAvatarColor(nombre: string): string {
    const str = nombre ?? '';
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = (Math.imul(h, 0x01000193)) >>> 0;
    }
    return this.avatarColors[h % this.avatarColors.length];
  }
}
