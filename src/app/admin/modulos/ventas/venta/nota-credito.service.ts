import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../service/api.service';
import { NotaCredito, NotaCreditoRequest } from '../../../entities/NotaCredito';

@Injectable({ providedIn: 'root' })
export class NotaCreditoService {

  private api = inject(ApiService);

  emitir(ventaId: string, request: NotaCreditoRequest): Observable<NotaCredito> {
    return this.api.post<NotaCredito>(`/ventas/venta/${ventaId}/nota-credito`, request);
  }

  obtenerPorVenta(ventaId: string): Observable<NotaCredito> {
    return this.api.get<NotaCredito>(`/ventas/venta/${ventaId}/nota-credito`);
  }
}
