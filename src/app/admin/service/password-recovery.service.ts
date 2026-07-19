import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  nuevaClave: string;
}

@Injectable({ providedIn: 'root' })
export class PasswordRecoveryService {
  private api = inject(ApiService);

  solicitarRecuperacion(request: ForgotPasswordRequest): Observable<void> {
    return this.api.post<void>('/auth/forgot-password', request);
  }

  resetearContrasenia(request: ResetPasswordRequest): Observable<void> {
    return this.api.post<void>('/auth/reset-password', request);
  }
}
