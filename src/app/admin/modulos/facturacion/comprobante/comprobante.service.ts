import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap, finalize } from 'rxjs';
import { ColDef } from 'ag-grid-enterprise';
import { ApiService } from '../../../service/api.service';
import { CargandoService } from '../../../service/cargando.service';
import { UtilService } from '../../../service/util.service';
import { Comprobante } from '../../../entities/Comprobante';

@Injectable({ providedIn: 'root' })
export class ComprobanteService {

  private readonly api = inject(ApiService);
  private readonly cargando = inject(CargandoService);
  private readonly utilService = inject(UtilService);

  readonly listaComprobantes = signal<Comprobante[]>([]);

  obtenerPorVenta(ventaId: string): Observable<Comprobante> {
    this.cargando.activar();
    return this.api.get<Comprobante>(`/facturacion/comprobante/${ventaId}`).pipe(
      finalize(() => this.cargando.inactivar())
    );
  }

  reintentar(ventaId: string): Observable<Comprobante> {
    this.cargando.activar();
    return this.api.post<Comprobante>(`/facturacion/comprobante/${ventaId}/reintentar`, {}).pipe(
      tap((data) => {
        this.listaComprobantes.update((list) =>
          list.map((c) => (c.ventaId === ventaId ? data : c))
        );
      }),
      finalize(() => this.cargando.inactivar())
    );
  }

  cargar(): Observable<Comprobante[]> {
    this.cargando.activar();
    return this.api.get<Comprobante[]>('/facturacion/comprobante').pipe(
      tap((data) => this.listaComprobantes.set(data)),
      finalize(() => this.cargando.inactivar())
    );
  }

  generarColumnasListado(): ColDef[] {
    return [
      { headerName: 'ID Venta', field: 'ventaId', hide: true },
      {
        headerName: '',
        checkboxSelection: true,
        headerCheckboxSelection: true,
        width: 44, minWidth: 44, maxWidth: 44,
        resizable: false, sortable: false, filter: false,
        suppressHeaderMenuButton: true,
        cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
      },
      {
        headerName: 'Comprobante',
        colId: 'comprobante',
        valueGetter: (p: { data: Comprobante }) => p.data?.numeroComprobante,
        flex: 2,
        minWidth: 200,
        cellStyle: { display: 'flex', alignItems: 'center' },
        cellRenderer: (params: { data: Comprobante }) => {
          const c   = params.data;
          const num = c.numeroComprobante ?? '—';
          const sub = c.ventaId ? `Venta: ${c.ventaId.substring(0, 8)}…` : '';
          return `<div style="display:flex;align-items:center;gap:8px">
            <div style="width:26px;height:26px;border-radius:6px;background:#3a9fc4;display:flex;align-items:center;justify-content:center;color:#fff;font-size:8px;font-weight:700;flex-shrink:0">SRI</div>
            <div style="display:flex;flex-direction:column;gap:1px">
              <span style="font-size:12px;font-weight:600;line-height:1.3;font-family:monospace">${num}</span>
              <span style="font-size:10px;opacity:0.5;line-height:1.3">${sub}</span>
            </div>
          </div>`;
        },
      },
      { headerName: 'N° Comprobante', field: 'numeroComprobante', hide: true },
      {
        headerName: 'Estado',
        colId: 'estadoSri',
        field: 'estado',
        width: 130,
        minWidth: 110,
        cellStyle: { display: 'flex', alignItems: 'center' },
        cellRenderer: (params: { data: Comprobante }) => {
          const e = params.data?.estado ?? '';
          const map: Record<string, { bg: string; color: string }> = {
            AUTORIZADO: { bg: '#dcfce7', color: '#166534' },
            ENVIADO:    { bg: '#dbeafe', color: '#1e40af' },
            PENDIENTE:  { bg: '#fef9c3', color: '#854d0e' },
            DEVUELTO:   { bg: '#ffedd5', color: '#9a3412' },
            ERROR:      { bg: '#fee2e2', color: '#991b1b' },
          };
          const s = map[e] ?? { bg: 'var(--surface-border)', color: 'var(--text-color-secondary)' };
          return `<span style="font-size:10px;font-weight:600;padding:2px 8px;border-radius:9999px;background:${s.bg};color:${s.color}">${e}</span>`;
        },
      },
      {
        headerName: 'Clave de acceso',
        field: 'claveAcceso',
        flex: 2,
        minWidth: 160,
        cellStyle: { display: 'flex', alignItems: 'center' },
        cellRenderer: (params: { data: Comprobante }) => {
          const clave = params.data?.claveAcceso ?? '';
          if (!clave) return `<span style="font-size:11px;opacity:0.4;font-style:italic">— pendiente —</span>`;
          const visible = clave.length > 20 ? clave.substring(0, 20) + '…' : clave;
          return `<span style="font-size:10px;font-family:monospace;opacity:0.7">${visible}</span>`;
        },
      },
      {
        headerName: 'Fecha autorización',
        field: 'fechaAutorizacion',
        width: 170,
        minWidth: 140,
        cellStyle: { display: 'flex', alignItems: 'center' },
        cellRenderer: (params: { data: Comprobante }) => {
          const fecha = params.data?.fechaAutorizacion;
          if (!fecha) return `<span style="font-size:11px;opacity:0.4">—</span>`;
          const d = new Date(fecha);
          const fmt = d.toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' });
          return `<span style="font-size:11px">${fmt}</span>`;
        },
      },
      { headerName: 'N° Autorización',    field: 'numeroAutorizacion',  hide: true },
      { headerName: 'Fecha Autorización',  field: 'fechaAutorizacion',   hide: true },
      this.utilService.getColumnaAcciones(),
    ];
  }
}
