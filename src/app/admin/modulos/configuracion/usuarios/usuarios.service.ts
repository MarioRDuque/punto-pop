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
      { headerName: 'Usuario',    field: 'usuEmail', width: 120, minWidth: 120 },
      { headerName: 'Nombre',     field: 'usuNombre',   width: 120, minWidth: 120 },
      { headerName: 'Apellidos',  field: 'usuApellidos', width: 250, minWidth: 250 },
      { headerName: 'E-mail',     field: 'usuEmail',    width: 200, minWidth: 200 },
      { headerName: 'Teléfono',   field: 'usuTelefono', width: 100, minWidth: 100 },
      { headerName: 'Dirección',  field: 'usuDireccion', width: 250, minWidth: 250 },
      {
        headerName: 'Estado',
        field: 'usuEstado',
        cellRenderer: 'agCheckboxCellRenderer',
        cellRendererParams: { disabled: true },
        width: 100, minWidth: 100, maxWidth: 100,
        cellStyle: { textAlign: 'center' },
      },
      this.utilService.getColumnaAcciones(),
    ];
  }
}
