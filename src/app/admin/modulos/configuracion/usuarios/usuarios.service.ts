import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../service/api.service';
import { ConfUsuario } from '../../../entities/ConfUsuario';
import { CargandoService } from '../../../service/cargando.service';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {

  private api = inject(ApiService);
  private cargando = inject(CargandoService);
  public usuarios = signal<ConfUsuario[]>([]);

  listarUsuarios(): Observable<ConfUsuario[]> {
    return this.api.get<ConfUsuario[]>('configuracion/usuario');
  }

  guardar(usuario: ConfUsuario): Observable<ConfUsuario> {
    return this.api.post<ConfUsuario>('configuracion/usuario', usuario);
  }

  actualizar(usuario: ConfUsuario): Observable<ConfUsuario> {
    return this.api.put<ConfUsuario>('configuracion/usuario/'+usuario.usuUsername, usuario);
  }

  cargar() {
    this.cargando.activar();
    this.listarUsuarios().subscribe(
      { next: (data) => this.despuesDeCargar(data) }
    );
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

}
