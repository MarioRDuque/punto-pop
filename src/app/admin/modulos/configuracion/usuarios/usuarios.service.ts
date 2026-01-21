import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../service/api.service';
import { Usuario } from '../../../entities/Usuario';
import { environment } from '../../../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  
  private api = inject(ApiService);
  private readonly baseUrl = environment.apiUrl;

  obtenerUsuarios(): Observable<Usuario[]> {
    return this.api.get<Usuario[]>('configuracion/usuario');
  }

  guardar(usuario: Usuario): Observable<void> {
    return this.api.post<void>('configuracion/usuario', usuario);
  }
  
}
