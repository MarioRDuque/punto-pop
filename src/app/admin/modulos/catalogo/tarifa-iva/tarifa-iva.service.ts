import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap, finalize } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ApiService } from '../../../service/api.service';
import { CargandoService } from '../../../service/cargando.service';
import { CatTarifaIva } from '../../../entities/CatTarifaIva';
import { PageResponse } from '../../../entities/PageResponse';

const CACHE_KEY = 'tarifas-iva';

@Injectable({ providedIn: 'root' })
export class TarifaIvaService {

  private readonly api      = inject(ApiService);
  private readonly cargando = inject(CargandoService);

  readonly listaTarifas = signal<CatTarifaIva[]>([]);

  cargar(): Observable<PageResponse<CatTarifaIva>> {
    this.cargando.activar();
    const params = new HttpParams().set('size', '100');
    return this.api.get<PageResponse<CatTarifaIva>>('/catalogo/tarifa-iva', params).pipe(
      tap((page) => this.listaTarifas.set(page.content)),
      finalize(() => this.cargando.inactivar())
    );
  }
}
