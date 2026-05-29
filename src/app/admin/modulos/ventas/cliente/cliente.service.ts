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
    return this.api.put<VentaCliente>(`/ventas/cliente/${cliente.identificacion}`, cliente).pipe(
      tap(() => this.cache.invalidar(CACHE_KEY))
    );
  }

  eliminar(cliente: VentaCliente): Observable<VentaCliente> {
    return this.api.delete<VentaCliente>(`/ventas/cliente/${cliente.identificacion}`).pipe(
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
      list.map((c) => (c.identificacion === item.identificacion ? item : c))
    );
    this.cache.invalidar(CACHE_KEY);
  }

  eliminarDelGrid(item: VentaCliente): void {
    this.listaClientes.update((list) =>
      list.filter((c) => c.identificacion !== item.identificacion)
    );
    this.cache.invalidar(CACHE_KEY);
  }

  generarColumnasListado(): ColDef[] {
    return [
      { headerName: 'Identificación', field: 'identificacion', hide: true },
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
        cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
      },
      {
        headerName: 'Nombre',
        colId: 'nombre',
        valueGetter: (p: { data: VentaCliente }) => p.data?.nombre,
        flex: 2,
        minWidth: 200,
        cellStyle: { display: 'flex', alignItems: 'center' },
        cellRenderer: (params: { data: VentaCliente }) => {
          const c = params.data;
          const initials = this.getInitials(c.nombre);
          const color = this.getAvatarColor(c.nombre);
          return `<div style="display:flex;align-items:center;gap:8px">
            <div style="width:26px;height:26px;border-radius:6px;background:${color};display:flex;align-items:center;justify-content:center;color:#fff;font-size:9px;font-weight:700;flex-shrink:0">${initials}</div>
            <div style="display:flex;flex-direction:column;gap:1px">
              <span style="font-size:12px;font-weight:600;line-height:1.3">${c.nombre}</span>
              <span style="font-size:10px;opacity:0.5;line-height:1.3">${c.tipoIdentificacion} · ${c.identificacion}</span>
            </div>
          </div>`;
        },
      },
      { headerName: 'Tipo Identificación', field: 'tipoIdentificacion', hide: true },
      { headerName: 'Identificación', field: 'identificacion', hide: true },
      {
        headerName: 'Email',
        colId: 'email',
        valueGetter: (p: { data: VentaCliente }) => p.data?.email,
        flex: 2,
        minWidth: 180,
        cellStyle: { display: 'flex', alignItems: 'center' },
        cellRenderer: (params: { data: VentaCliente }) => {
          const c = params.data;
          const em = c.email
            ? `<span style="display:flex;align-items:center;gap:4px"><i class="pi pi-envelope" style="font-size:8px;opacity:0.4"></i>${c.email}</span>`
            : `<span style="display:flex;align-items:center;gap:4px;opacity:0.4;font-style:italic"><i class="pi pi-envelope" style="font-size:8px"></i>— sin email</span>`;
          const ph = c.telefono
            ? `<span style="display:flex;align-items:center;gap:4px"><i class="pi pi-phone" style="font-size:8px;opacity:0.4"></i>${c.telefono}</span>`
            : `<span style="display:flex;align-items:center;gap:4px;opacity:0.4;font-style:italic"><i class="pi pi-phone" style="font-size:8px"></i>— sin teléfono</span>`;
          return `<div style="display:flex;flex-direction:column;justify-content:center;gap:2px;font-size:11px;line-height:1.3">${em}${ph}</div>`;
        },
      },
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
    '#5271df', // azul medio
    '#3ea882', // verde esmeralda
    '#e0834e', // terracota
    '#9b6dd4', // violeta suave
    '#3a9fc4', // azul cielo
    '#d4646e', // rosa oscuro
    '#4aab8e', // teal
    '#c47f3a', // ámbar oscuro
    '#6b7fd4', // índigo suave
    '#5aa87b', // verde medio
    '#c45c8c', // rosa frambuesa
    '#4d98c4', // azul acero
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
