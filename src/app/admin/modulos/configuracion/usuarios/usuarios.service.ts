import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../service/api.service';
import { ConfUsuario } from '../../../entities/ConfUsuario';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  
  private api = inject(ApiService);

  listarUsuarios(): Observable<ConfUsuario[]> {
    return this.api.get<ConfUsuario[]>('configuracion/usuario');
  }

  guardar(usuario: ConfUsuario): Observable<void> {
    return this.api.post<void>('configuracion/usuario', usuario);
  }
  
}
