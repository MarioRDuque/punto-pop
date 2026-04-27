import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../service/api.service';
import { NotaDebito, NotaDebitoRequest } from '../../../entities/NotaDebito';

@Injectable({ providedIn: 'root' })
export class NotaDebitoService {

  private api = inject(ApiService);

  emitir(ventaId: string, request: NotaDebitoRequest): Observable<NotaDebito> {
    return this.api.post<NotaDebito>(`/ventas/venta/${ventaId}/nota-debito`, request);
  }

  obtenerPorVenta(ventaId: string): Observable<NotaDebito> {
    return this.api.get<NotaDebito>(`/ventas/venta/${ventaId}/nota-debito`);
  }
}
