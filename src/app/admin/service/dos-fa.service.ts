import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class DosFAService {

  private api = inject(ApiService);

  generarQR(): Observable<{ qrUrl: string; secret: string }> {
    return this.api.post<{ qrUrl: string; secret: string }>('/auth/2fa/generar', {});
  }

  activar2FA(codigo: string): Observable<void> {
    return this.api.post<void>('/auth/2fa/activar', { codigo });
  }

  desactivar2FA(codigo: string): Observable<void> {
    return this.api.post<void>('/auth/2fa/desactivar', { codigo });
  }
}
