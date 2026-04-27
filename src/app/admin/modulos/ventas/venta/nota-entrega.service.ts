import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import printJS from 'print-js';
import { ApiService } from '../../../service/api.service';

export interface NotaEntregaItem {
  productoCodigo: string;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  subtotal: number;
}

export interface NotaEntrega {
  numero: string;
  fechaEmision: string;
  empresaRazonSocial: string;
  empresaNombreComercial: string;
  empresaRuc: string;
  ventaNumero: string;
  ventaFecha: string;
  formaPago: string;
  observacion?: string;
  clienteNombre: string;
  clienteIdentificacion: string;
  clienteTelefono?: string;
  clienteDireccion?: string;
  items: NotaEntregaItem[];
  subtotal: number;
  descuento: number;
  iva: number;
  total: number;
  generadoPor: string;
}

@Injectable({ providedIn: 'root' })
export class NotaEntregaService {

  private api = inject(ApiService);

  obtener(ventaId: string): Observable<NotaEntrega> {
    return this.api.get<NotaEntrega>(`/ventas/venta/${ventaId}/nota-entrega`);
  }

  imprimir(nota: NotaEntrega): void {
    printJS({
      printable: this.html(nota),
      type: 'raw-html',
      scanStyles: false,
      style: this.css(),
    });
  }

  private html(n: NotaEntrega): string {
    const nombreComercial = n.empresaNombreComercial || n.empresaRazonSocial || '';
    const esDistinto = nombreComercial !== n.empresaRazonSocial && n.empresaRazonSocial;

    const filas = n.items.map(i => `
      <tr>
        <td class="mono">${this.esc(i.productoCodigo)}</td>
        <td>${this.esc(i.productoNombre)}</td>
        <td class="r">${this.num(i.cantidad)}</td>
        <td class="r">${this.money(i.precioUnitario)}</td>
        <td class="r">${this.money(i.descuento)}</td>
        <td class="r b">${this.money(i.subtotal)}</td>
      </tr>`).join('');

    return `
<div class="nota">
  <div class="header">
    <div class="empresa">
      <div class="empresa-nombre">${this.esc(nombreComercial)}</div>
      ${esDistinto ? `<div class="empresa-legal">${this.esc(n.empresaRazonSocial)}</div>` : ''}
      <div class="empresa-ruc">RUC: ${n.empresaRuc || '—'}</div>
    </div>
    <div class="doc-box">
      <div class="doc-titulo">NOTA DE ENTREGA</div>
      <div class="doc-numero">${n.numero}</div>
      <div class="doc-fecha">Emitida: ${this.date(n.fechaEmision)}</div>
    </div>
  </div>

  <div class="seccion">
    <div class="label">Cliente</div>
    <div class="cliente-nombre">${this.esc(n.clienteNombre)}</div>
    <div class="cliente-extra">
      ID: ${n.clienteIdentificacion}
      ${n.clienteTelefono ? ` &nbsp;·&nbsp; Tel: ${n.clienteTelefono}` : ''}
      ${n.clienteDireccion ? ` &nbsp;·&nbsp; Dir: ${this.esc(n.clienteDireccion)}` : ''}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Código</th><th>Descripción</th>
        <th class="r">Cant.</th><th class="r">P. Unit.</th>
        <th class="r">Descto.</th><th class="r">Subtotal</th>
      </tr>
    </thead>
    <tbody>${filas}</tbody>
  </table>

  <div class="totales-wrap">
    <div class="totales">
      <div class="trow"><span>Subtotal</span><span>${this.money(n.subtotal)}</span></div>
      <div class="trow"><span>Descuento</span><span>${this.money(n.descuento)}</span></div>
      <div class="trow"><span>IVA 15%</span><span>${this.money(n.iva)}</span></div>
      <div class="tfinal"><span>TOTAL</span><span>${this.money(n.total)}</span></div>
    </div>
  </div>

  <div class="ref">
    Ref. venta: ${n.ventaNumero} &nbsp;·&nbsp; Fecha venta: ${this.date(n.ventaFecha)}
    &nbsp;·&nbsp; Pago: ${n.formaPago}
    ${n.observacion ? ` &nbsp;·&nbsp; Obs: ${this.esc(n.observacion)}` : ''}
  </div>

  <div class="firmas">
    <div class="firma-box">
      <div class="firma-label">ENTREGADO POR</div>
      <div class="firma-linea"></div>
      <div class="firma-pie">Nombre / Firma</div>
    </div>
    <div class="firma-box">
      <div class="firma-label">RECIBIDO POR</div>
      <div class="firma-linea"></div>
      <div class="firma-pie">Nombre / Firma / C.I.</div>
    </div>
  </div>
</div>`;
  }

  private css(): string {
    return `
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: Arial, sans-serif; font-size: 12px; color: #222; }
.nota { max-width: 820px; margin: 0 auto; padding: 24px; }
.header { display: flex; justify-content: space-between; align-items: flex-start;
  border-bottom: 2px solid #222; padding-bottom: 14px; margin-bottom: 16px; }
.empresa-nombre { font-size: 16px; font-weight: bold; text-transform: uppercase; }
.empresa-legal  { font-size: 10px; color: #666; margin-top: 2px; }
.empresa-ruc    { font-size: 11px; color: #555; margin-top: 4px; }
.doc-box        { text-align: right; }
.doc-titulo     { font-size: 18px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; }
.doc-numero     { font-size: 13px; font-weight: bold; color: #555; margin-top: 4px; }
.doc-fecha      { font-size: 11px; color: #777; margin-top: 2px; }
.seccion        { background: #f7f7f7; border-radius: 4px; padding: 10px 14px; margin-bottom: 16px; }
.label          { font-size: 9px; font-weight: bold; text-transform: uppercase;
  letter-spacing: 1px; color: #999; margin-bottom: 5px; }
.cliente-nombre { font-size: 13px; font-weight: bold; }
.cliente-extra  { font-size: 11px; color: #555; margin-top: 3px; }
table           { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
thead           { background: #222; color: #fff; }
th              { padding: 7px 10px; font-size: 10px; font-weight: bold; text-transform: uppercase; }
td              { padding: 7px 10px; border-bottom: 1px solid #eee; font-size: 11px; }
tr:last-child td { border-bottom: none; }
.r    { text-align: right; }
.mono { font-family: 'Courier New', monospace; font-size: 10px; }
.b    { font-weight: bold; }
.totales-wrap { display: flex; justify-content: flex-end; margin-bottom: 14px; }
.totales  { width: 280px; }
.trow     { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #eee; font-size: 11px; }
.tfinal   { display: flex; justify-content: space-between; padding: 8px 0; border-top: 2px solid #222; font-weight: bold; font-size: 14px; }
.ref      { font-size: 10px; color: #888; border-top: 1px solid #eee; padding-top: 8px; margin-bottom: 32px; }
.firmas   { display: flex; justify-content: space-around; margin-top: 48px; }
.firma-box    { text-align: center; width: 220px; }
.firma-label  { font-size: 9px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 42px; }
.firma-linea  { border-top: 1px solid #444; width: 100%; }
.firma-pie    { font-size: 9px; color: #777; margin-top: 4px; }`;
  }

  private date(s: string): string {
    if (!s) return '—';
    const d = new Date(s);
    const p = (n: number) => String(n).padStart(2, '0');
    return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
  }

  private money(v: number): string {
    return `$${Number(v ?? 0).toFixed(2)}`;
  }

  private num(v: number): string {
    return Number(v ?? 0).toLocaleString('es-EC', { minimumFractionDigits: 0, maximumFractionDigits: 3 });
  }

  private esc(s: string | undefined | null): string {
    if (!s) return '';
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}
