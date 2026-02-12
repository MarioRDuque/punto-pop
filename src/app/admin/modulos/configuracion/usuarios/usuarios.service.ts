import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../service/api.service';
import { ConfUsuario } from '../../../entities/ConfUsuario';
import { CargandoService } from '../../../service/cargando.service';
import { ColDef } from 'ag-grid-enterprise';
import { TipoFiltro } from '../../../enums/tipo-filtro';
import { HttpParams } from '@angular/common/http';
import { UtilService } from '../../../service/util.service';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {

  private api = inject(ApiService);
  private cargando = inject(CargandoService);
  private utilService = inject(UtilService);
  public usuarios = signal<ConfUsuario[]>([]);

  listarUsuarios(): Observable<ConfUsuario[]> {
    return this.api.get<ConfUsuario[]>('configuracion/usuario');
  }

  guardar(usuario: ConfUsuario): Observable<ConfUsuario> {
    return this.api.post<ConfUsuario>('configuracion/usuario', usuario);
  }

  actualizar(usuario: ConfUsuario): Observable<ConfUsuario> {
    return this.api.put<ConfUsuario>('configuracion/usuario/' + usuario.usuUsername, usuario);
  }

  eliminar(usuario: ConfUsuario): Observable<ConfUsuario> {
    return this.api.delete<ConfUsuario>('configuracion/usuario/' + usuario.usuUsername);
  }

  cargar(filtro?: TipoFiltro, q?: string) {
    this.cargando.activar();
    let params: HttpParams = new HttpParams();
    if (filtro) {
      params = params.set('filtro', filtro);
    }
    if (q && q.trim().length > 0) {
      params = params.set('q', q.trim());
    }
    return this.api.get<ConfUsuario[]>('configuracion/usuario/filtrar', params).subscribe(
      { next: (data) => this.despuesDeCargar(data) }
    );;
  }

  despuesDeCargar(data: ConfUsuario[]) {
    this.usuarios.set(data);
    this.cargando.inactivar();
  }

  agregarAlGrid(usuario: ConfUsuario) {
    this.usuarios.update(list => [...list, usuario]);
  }

  actualizarElGrid(usuario: ConfUsuario) {
    this.usuarios.update(list =>
      list.map(u => u.usuUsername === usuario.usuUsername ? usuario : u)
    );
  }

  eliminarDelGrid(usuario: ConfUsuario) {
    this.usuarios.update(list =>
      list.filter(u => u.usuUsername !== usuario.usuUsername)
    );
  }

  generarColumnasListado(): ColDef[] {
    return [
      {
        headerName: "Usuario",
        field: "usuUsername",
        width: 120,
        minWidth: 120
      },
      {
        headerName: "Nombre",
        field: "usuNombre",
        width: 120,
        minWidth: 120
      },
      {
        headerName: "Apellidos",
        field: "usuApellidos",
        width: 250,
        minWidth: 250
      },
      {
        headerName: "E-mail",
        field: "usuEmail",
        width: 200,
        minWidth: 200
      },
      {
        headerName: "Teléfono",
        field: "usuTelefono",
        width: 100,
        minWidth: 100
      },
      {
        headerName: "Dirección",
        field: "usuDireccion",
        width: 250,
        minWidth: 250
      },
      {
        headerName: "Estado",
        field: "usuEstado",
        cellRenderer: 'agCheckboxCellRenderer',
        cellRendererParams: {
          disabled: true
        },
        width: 100,
        minWidth: 100,
        maxWidth: 100,
        cellStyle: {
          textAlign: 'center'
        }
      },
      this.utilService.getColumnaAcciones()
    ];
  }

}
