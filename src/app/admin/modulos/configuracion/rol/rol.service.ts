import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../service/api.service';
import { ConfRol } from '../../../entities/ConfRol';
import { CargandoService } from '../../../service/cargando.service';
import { ColDef } from 'ag-grid-enterprise';
import { TipoFiltro } from '../../../enums/tipo-filtro';
import { HttpParams } from '@angular/common/http';
import { UtilService } from '../../../service/util.service';

@Injectable({
  providedIn: 'root',
})
export class RolService {

  private api = inject(ApiService);
  private cargando = inject(CargandoService);
  private utilService = inject(UtilService);
  public listaRoles = signal<ConfRol[]>([]);

  listarRol(): Observable<ConfRol[]> {
    return this.api.get<ConfRol[]>('configuracion/rol');
  }

  guardar(rol: ConfRol): Observable<ConfRol> {
    return this.api.post<ConfRol>('configuracion/rol', rol);
  }

  actualizar(rol: ConfRol): Observable<ConfRol> {
    return this.api.put<ConfRol>('configuracion/rol/' + rol.rolCodigo, rol);
  }

  eliminar(rol: ConfRol): Observable<ConfRol> {
    return this.api.delete<ConfRol>('configuracion/rol/' + rol.rolCodigo);
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
    return this.api.get<ConfRol[]>('configuracion/rol/filtrar', params).subscribe(
      { next: (data) => this.despuesDeCargar(data) }
    );;
  }

  despuesDeCargar(data: ConfRol[]) {
    this.listaRoles.set(data);
    this.cargando.inactivar();
  }

  agregarAlGrid(rol: ConfRol) {
    this.listaRoles.update(list => [...list, rol]);
  }

  actualizarElGrid(rol: ConfRol) {
    this.listaRoles.update(list =>
      list.map(u => u.rolCodigo === rol.rolCodigo ? rol : u)
    );
  }

  eliminarDelGrid(rol: ConfRol) {
    this.listaRoles.update(list =>
      list.filter(u => u.rolCodigo !== rol.rolCodigo)
    );
  }

  generarColumnasListado(): ColDef[] {
    return [
      {
        headerName: "Código",
        field: "rolCodigo",
        width: 120,
        minWidth: 120
      },
      {
        headerName: "Descripción",
        field: "rolDescripcion",
        width: 120,
        minWidth: 120
      },
      {
        headerName: "Estado",
        field: "rolEstado",
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
