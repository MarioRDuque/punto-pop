import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService, UsuarioSesion } from './auth.service';

export interface LoginRequest {
  username: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class LoginService {

  private api = inject(ApiService);
  private authService = inject(AuthService);

  login(credentials: LoginRequest): Observable<UsuarioSesion> {
    return this.api.post<UsuarioSesion>('/auth/login', credentials).pipe(
      tap(usuario => this.authService.setUsuario(usuario))
    );
  }
}
