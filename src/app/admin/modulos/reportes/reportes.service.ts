import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReportesService {

  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  private descargar(endpoint: string, params?: HttpParams): Observable<Blob> {
    return this.http.get(`${this.baseUrl}${endpoint}`, { responseType: 'blob', params });
  }

  ventasPdf(estado?: string, desde?: string, hasta?: string): Observable<Blob> {
    let params = new HttpParams();
    if (estado) params = params.set('estado', estado);
    if (desde) params = params.set('desde', `${desde}T00:00:00`);
    if (hasta) params = params.set('hasta', `${hasta}T23:59:59`);
    return this.descargar('/reportes/ventas/pdf', params);
  }

  ventasXlsx(estado?: string, desde?: string, hasta?: string): Observable<Blob> {
    let params = new HttpParams();
    if (estado) params = params.set('estado', estado);
    if (desde) params = params.set('desde', `${desde}T00:00:00`);
    if (hasta) params = params.set('hasta', `${hasta}T23:59:59`);
    return this.descargar('/reportes/ventas/xlsx', params);
  }

  stockPdf(): Observable<Blob> {
    return this.descargar('/reportes/stock/pdf');
  }

  stockXlsx(): Observable<Blob> {
    return this.descargar('/reportes/stock/xlsx');
  }

  usuariosPdf(): Observable<Blob> {
    return this.descargar('/reportes/usuarios/pdf');
  }

  abrirBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
