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
      {
        headerName: '',
        checkboxSelection: true,
        headerCheckboxSelection: true,
        width: 44,
        minWidth: 44,
        maxWidth: 44,
        resizable: false,
        sortable: false,
        filter: false,
        suppressHeaderMenuButton: true,
      },
      {
        headerName: 'Cliente',
        colId: 'nombre',
        valueGetter: (p: { data: VentaCliente }) => p.data?.nombre,
        flex: 2,
        minWidth: 200,
        cellStyle: { display: 'flex', alignItems: 'center' },
        cellRenderer: (params: { data: VentaCliente }) => {
          const c = params.data;
          const initials = this.getInitials(c.nombre);
          const color = this.getAvatarColor(c.nombre);
          return `<div style="display:flex;align-items:center;gap:10px">
            <div style="width:30px;height:30px;border-radius:7px;background:${color};display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:700;flex-shrink:0">${initials}</div>
            <div style="display:flex;flex-direction:column;gap:1px">
              <span style="font-size:13px;font-weight:600;line-height:1.3">${c.nombre}</span>
              <span style="font-size:11px;opacity:0.55;line-height:1.3">${c.tipoIdentificacion} · ${c.identificacion}</span>
            </div>
          </div>`;
        },
      },
      {
        headerName: 'Contacto',
        colId: 'email',
        valueGetter: (p: { data: VentaCliente }) => p.data?.email,
        flex: 2,
        minWidth: 180,
        cellStyle: { display: 'flex', alignItems: 'center' },
        cellRenderer: (params: { data: VentaCliente }) => {
          const c = params.data;
          const em = c.email
            ? `<span style="display:flex;align-items:center;gap:4px"><i class="pi pi-envelope" style="font-size:9px;opacity:0.45"></i>${c.email}</span>`
            : `<span style="display:flex;align-items:center;gap:4px;opacity:0.45;font-style:italic"><i class="pi pi-envelope" style="font-size:9px"></i>— sin email</span>`;
          const ph = c.telefono
            ? `<span style="display:flex;align-items:center;gap:4px"><i class="pi pi-phone" style="font-size:9px;opacity:0.45"></i>${c.telefono}</span>`
            : `<span style="display:flex;align-items:center;gap:4px;opacity:0.45;font-style:italic"><i class="pi pi-phone" style="font-size:9px"></i>— sin teléfono</span>`;
          return `<div style="display:flex;flex-direction:column;justify-content:center;gap:3px;font-size:12px;line-height:1.3">${em}${ph}</div>`;
        },
      },
      {
        headerName: 'Estado',
        field: 'estado',
        width: 115,
        minWidth: 100,
        maxWidth: 130,
        cellStyle: { display: 'flex', alignItems: 'center' },
        cellRenderer: (params: { value: boolean }) => {
          const activo = params.value;
          const dot  = activo ? '#16a34a' : '#dc2626';
          const text = activo ? '#374151' : '#9ca3af';
          return `<span style="display:inline-flex;align-items:center;gap:6px;font-size:12px;color:${text}">
            <span style="width:7px;height:7px;border-radius:50%;background:${dot};flex-shrink:0"></span>
            ${activo ? 'Activo' : 'Inactivo'}
          </span>`;
        },
      },
      this.utilService.getColumnaAcciones(),
    ];
  }

  private getInitials(nombre: string): string {
    const parts = (nombre ?? '').trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return (nombre ?? '??').substring(0, 2).toUpperCase();
  }

  private readonly avatarColors = [
    '#16a34a', '#ea580c', '#7c3aed', '#dc2626',
    '#0d9488', '#2563eb', '#a855f7', '#d97706',
    '#0891b2', '#db2777', '#65a30d', '#9333ea',
  ];

  private getAvatarColor(nombre: string): string {
    let hash = 0;
    for (const char of nombre ?? '') hash = ((hash * 31) + char.charCodeAt(0)) | 0;
    return this.avatarColors[Math.abs(hash) % this.avatarColors.length];
  }
}
