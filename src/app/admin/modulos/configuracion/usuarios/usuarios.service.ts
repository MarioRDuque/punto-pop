import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap, finalize } from 'rxjs';
import { ApiService } from '../../../service/api.service';
import { ConfUsuario } from '../../../entities/ConfUsuario';
import { CargandoService } from '../../../service/cargando.service';
import { CacheService } from '../../../service/cache.service';
import { ColDef } from 'ag-grid-enterprise';
import { TipoFiltro } from '../../../enums/tipo-filtro';
import { HttpParams } from '@angular/common/http';
import { UtilService } from '../../../service/util.service';

const CACHE_KEY = 'usuarios';

@Injectable({ providedIn: 'root' })
export class UsuariosService {

  private readonly api = inject(ApiService);
  private readonly cargando = inject(CargandoService);
  private readonly cache = inject(CacheService);
  private readonly utilService = inject(UtilService);

  readonly usuarios = signal<ConfUsuario[]>([]);

  listarUsuarios(): Observable<ConfUsuario[]> {
    return this.api.get<ConfUsuario[]>('/configuracion/usuario');
  }

  obtenerUsuario(username: string): Observable<ConfUsuario> {
    return this.api.get<ConfUsuario>(`/configuracion/usuario/${username}`);
  }

  guardar(usuario: ConfUsuario): Observable<ConfUsuario> {
    return this.api.post<ConfUsuario>('/configuracion/usuario/guardar', usuario).pipe(
      tap(() => this.cache.invalidar(CACHE_KEY))
    );
  }

  actualizar(usuario: ConfUsuario): Observable<ConfUsuario> {
    return this.api.put<ConfUsuario>(`/configuracion/usuario/${usuario.usuEmail}`, usuario).pipe(
      tap(() => this.cache.invalidar(CACHE_KEY))
    );
  }

  eliminar(usuario: ConfUsuario): Observable<ConfUsuario> {
    return this.api.delete<ConfUsuario>(`/configuracion/usuario/${usuario.usuEmail}`).pipe(
      tap(() => this.cache.invalidar(CACHE_KEY))
    );
  }

  /** Carga usuarios desde el backend y actualiza la señal. Devuelve el Observable para que el caller pueda hacer takeUntilDestroyed. */
  cargar(filtro?: TipoFiltro, q?: string): Observable<ConfUsuario[]> {
    this.cargando.activar();
    let params = new HttpParams();
    if (filtro) params = params.set('filtro', filtro);
    if (q?.trim()) params = params.set('q', q.trim());

    return this.api.get<ConfUsuario[]>('/configuracion/usuario/filtrar', params).pipe(
      tap((data) => {
        this.usuarios.set(data);
        this.cache.set(CACHE_KEY, data);
      }),
      finalize(() => this.cargando.inactivar())
    );
  }

  agregarAlGrid(usuario: ConfUsuario): void {
    this.usuarios.update((list) => [...list, usuario]);
    this.cache.invalidar(CACHE_KEY);
  }

  actualizarElGrid(usuario: ConfUsuario): void {
    this.usuarios.update((list) =>
      list.map((u) => (u.usuEmail === usuario.usuEmail ? usuario : u))
    );
    this.cache.invalidar(CACHE_KEY);
  }

  eliminarDelGrid(usuario: ConfUsuario): void {
    this.usuarios.update((list) =>
      list.filter((u) => u.usuEmail !== usuario.usuEmail)
    );
    this.cache.invalidar(CACHE_KEY);
  }

  generarColumnasListado(): ColDef[] {
    return [
      { headerName: 'ID', field: 'usuEmail', hide: true },
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
        headerName: 'Usuario',
        colId: 'usuario',
        valueGetter: (p: { data: ConfUsuario }) => `${p.data?.usuNombre ?? ''} ${p.data?.usuApellidos ?? ''}`.trim(),
        flex: 2,
        minWidth: 220,
        cellStyle: { display: 'flex', alignItems: 'center' },
        cellRenderer: (params: { data: ConfUsuario }) => {
          const u           = params.data;
          const nombreCompleto = `${u.usuNombre ?? ''} ${u.usuApellidos ?? ''}`.trim() || '—';
          const avatar      = u.usuFoto
            ? `<img src="${u.usuFoto}" style="width:26px;height:26px;border-radius:6px;object-fit:cover;flex-shrink:0" />`
            : (() => {
                const ini1  = (u.usuNombre?.trim()    ?? '').charAt(0).toUpperCase();
                const ini2  = (u.usuApellidos?.trim() ?? '').charAt(0).toUpperCase();
                const inits = (ini1 + ini2) || ini1 || '?';
                const color = this.getAvatarColor(u.usuEmail ?? '');
                return `<div style="width:26px;height:26px;border-radius:6px;background:${color};display:flex;align-items:center;justify-content:center;color:#fff;font-size:9px;font-weight:700;flex-shrink:0">${inits}</div>`;
              })();
          return `<div style="display:flex;align-items:center;gap:8px">
            ${avatar}
            <div style="display:flex;flex-direction:column;gap:1px">
              <span style="font-size:12px;font-weight:600;line-height:1.3">${nombreCompleto}</span>
              <span style="font-size:10px;opacity:0.5;line-height:1.3">${u.usuEmail ?? ''}</span>
            </div>
          </div>`;
        },
      },
      { headerName: 'Nombre',    field: 'usuNombre',    hide: true },
      { headerName: 'Apellidos', field: 'usuApellidos', hide: true },
      { headerName: 'Email',     field: 'usuEmail',     hide: true },
      {
        headerName: 'Roles',
        colId: 'roles',
        valueGetter: (p: { data: ConfUsuario }) =>
          p.data?.roles?.map(r => r.rolDescripcion || r.rolCodigo).join(', ') ?? '',
        flex: 1,
        minWidth: 140,
        cellStyle: { display: 'flex', alignItems: 'center' },
        cellRenderer: (params: { data: ConfUsuario }) => {
          const roles = params.data?.roles ?? [];
          if (!roles.length) return `<span style="font-size:10px;opacity:0.4;font-style:italic">Sin roles</span>`;
          const badges = roles.map(r =>
            `<span style="font-size:9px;font-weight:600;padding:1px 6px;border-radius:9999px;background:var(--surface-border);color:var(--text-color-secondary)">${r.rolDescripcion || r.rolCodigo}</span>`
          ).join('');
          return `<div style="display:flex;gap:3px;flex-wrap:wrap;align-items:center">${badges}</div>`;
        },
      },
      {
        headerName: 'Contacto',
        colId: 'contacto',
        valueGetter: (p: { data: ConfUsuario }) => p.data?.usuTelefono,
        flex: 1,
        minWidth: 160,
        cellStyle: { display: 'flex', alignItems: 'center' },
        cellRenderer: (params: { data: ConfUsuario }) => {
          const u  = params.data;
          const ph = u.usuTelefono
            ? `<span style="display:flex;align-items:center;gap:4px"><i class="pi pi-phone" style="font-size:8px;opacity:0.4"></i>${u.usuTelefono}</span>`
            : `<span style="display:flex;align-items:center;gap:4px;opacity:0.4;font-style:italic"><i class="pi pi-phone" style="font-size:8px"></i>— sin teléfono</span>`;
          const dir = u.usuDireccion
            ? `<span style="display:flex;align-items:center;gap:4px"><i class="pi pi-map-marker" style="font-size:8px;opacity:0.4"></i>${u.usuDireccion}</span>`
            : `<span style="display:flex;align-items:center;gap:4px;opacity:0.4;font-style:italic"><i class="pi pi-map-marker" style="font-size:8px"></i>— sin dirección</span>`;
          return `<div style="display:flex;flex-direction:column;justify-content:center;gap:2px;font-size:11px;line-height:1.3">${ph}${dir}</div>`;
        },
      },
      { headerName: 'Teléfono',  field: 'usuTelefono',  hide: true },
      { headerName: 'Dirección', field: 'usuDireccion', hide: true },
      this.utilService.getColumnaEstado('usuEstado'),
      this.utilService.getColumnaAcciones(),
    ];
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
