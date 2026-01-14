import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../service/api.service';
import { Usuario } from '../../../entities/Usuario';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  
  private api = inject(ApiService);

  obtenerUsuarios(): Observable<Usuario[]> {
    return this.api.get<Usuario[]>('/usuarios');
  }

  guardar(usuario: Usuario): Observable<void> {
    return this.api.post<void>('/usuarios', usuario);
  }
  
}
