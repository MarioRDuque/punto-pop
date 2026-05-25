import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-highlights-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="highlights" class="pp-highlights">
      <div class="pp-highlights-head">
        <div class="pp-kicker">DOMINIO COMPLETO</div>
        <h2 class="pp-h2">Hecho para Ecuador,<br /><em>desde el primer comprobante.</em></h2>
      </div>

      <!-- Block 1 — SRI -->
      <div class="pp-row pp-row--right">
        <div class="pp-row-text">
          <div class="pp-block-icon"><i class="pi pi-file-check"></i></div>
          <h3 class="pp-block-title">Facturación electrónica SRI 2.0</h3>
          <p class="pp-block-desc">
            Autorización en línea, firma electrónica, contingencia automática, anulaciones, notas de crédito y débito. Todo desde la misma pantalla. Sin abrir el portal del SRI.
          </p>
          <ul class="pp-block-list">
            <li><i class="pi pi-check"></i><span>Comprobantes en lote — hasta 100 simultáneas</span></li>
            <li><i class="pi pi-check"></i><span>Reintentos automáticos en caso de error</span></li>
            <li><i class="pi pi-check"></i><span>Envío al cliente por email y WhatsApp</span></li>
          </ul>
        </div>
        <div class="pp-row-visual">
          <div class="pp-mock pp-mock--sri">
            <div class="pp-mock-header">
              <span class="pp-mock-kicker">SRI · TIEMPO REAL</span>
              <span class="pp-mock-live"><span class="pp-mock-livedot"></span>EN LÍNEA</span>
            </div>
            <div class="pp-mock-rows">
              <div class="pp-mock-row pp-mock-row--ok">
                <span class="pp-mock-mono">001-100-000000142</span>
                <span class="pp-mock-name">Carla Mendoza</span>
                <span class="pp-mock-badge pp-mock-badge--ok">Autorizado</span>
                <span class="pp-mock-amt">$24.78</span>
              </div>
              <div class="pp-mock-row pp-mock-row--ok">
                <span class="pp-mock-mono">001-100-000000141</span>
                <span class="pp-mock-name">Jorge Pinto S.A.</span>
                <span class="pp-mock-badge pp-mock-badge--ok">Autorizado</span>
                <span class="pp-mock-amt">$348.20</span>
              </div>
              <div class="pp-mock-row">
                <span class="pp-mock-mono">001-100-000000140</span>
                <span class="pp-mock-name">Distrib. Vela</span>
                <span class="pp-mock-badge pp-mock-badge--proc">Procesando…</span>
                <span class="pp-mock-amt">$1,247.00</span>
              </div>
            </div>
            <div class="pp-mock-footer">
              <span>302/312 hoy</span>
              <strong>99.4% éxito</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- Block 2 — Inventory -->
      <div class="pp-row">
        <div class="pp-row-visual">
          <div class="pp-mock pp-mock--inv">
            <div class="pp-mock-header">
              <span class="pp-mock-kicker">INVENTARIO · ALERTAS</span>
              <span class="pp-mock-count">7 críticos</span>
            </div>
            <div class="pp-mock-bars">
              <div class="pp-mock-bar">
                <div class="pp-mock-bar-head">
                  <span>Queso fresco · 250g</span>
                  <span class="pp-mock-bar-num">3 / 20</span>
                </div>
                <div class="pp-mock-bar-track">
                  <div class="pp-mock-bar-fill pp-mock-bar-fill--danger" style="width: 15%"></div>
                </div>
              </div>
              <div class="pp-mock-bar">
                <div class="pp-mock-bar-head">
                  <span>Yogur natural · 1L</span>
                  <span class="pp-mock-bar-num">8 / 25</span>
                </div>
                <div class="pp-mock-bar-track">
                  <div class="pp-mock-bar-fill pp-mock-bar-fill--warn" style="width: 32%"></div>
                </div>
              </div>
              <div class="pp-mock-bar">
                <div class="pp-mock-bar-head">
                  <span>Pan baguette · 400g</span>
                  <span class="pp-mock-bar-num">12 / 30</span>
                </div>
                <div class="pp-mock-bar-track">
                  <div class="pp-mock-bar-fill pp-mock-bar-fill--warn" style="width: 40%"></div>
                </div>
              </div>
              <div class="pp-mock-bar">
                <div class="pp-mock-bar-head">
                  <span>Leche semi · 1L</span>
                  <span class="pp-mock-bar-num">18 / 40</span>
                </div>
                <div class="pp-mock-bar-track">
                  <div class="pp-mock-bar-fill" style="width: 45%"></div>
                </div>
              </div>
            </div>
            <button class="pp-mock-go">Generar orden de compra <i class="pi pi-arrow-right"></i></button>
          </div>
        </div>
        <div class="pp-row-text">
          <div class="pp-block-icon"><i class="pi pi-box"></i></div>
          <h3 class="pp-block-title">Inventario que se cuida solo</h3>
          <p class="pp-block-desc">
            Sincroniza stock entre sucursales en tiempo real. Recibe alertas cuando se acerca el mínimo y deja que Punto Pop sugiera la orden de compra al proveedor correcto.
          </p>
          <ul class="pp-block-list">
            <li><i class="pi pi-check"></i><span>Mínimos y máximos por producto y bodega</span></li>
            <li><i class="pi pi-check"></i><span>Kardex automático con costo promedio</span></li>
            <li><i class="pi pi-check"></i><span>Transferencias entre sucursales con un clic</span></li>
          </ul>
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }

    .pp-highlights {
      padding: 4rem 1.5rem;
      max-width: 1280px;
      margin: 0 auto;
    }
    @media (min-width: 1024px) {
      .pp-highlights { padding: 6rem 5rem; }
    }

    .pp-highlights-head {
      max-width: 36rem;
      margin: 0 auto 5rem;
      text-align: center;
    }
    .pp-kicker {
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: 0.75rem;
      color: var(--pp-text-3);
      letter-spacing: 0.12em;
      margin-bottom: 1rem;
    }
    .pp-h2 {
      margin: 0;
      font-size: clamp(1.875rem, 3.5vw, 2.75rem);
      font-weight: 600;
      letter-spacing: -0.025em;
      line-height: 1.1;
      color: var(--text-color);
    }
    .pp-h2 em {
      font-style: normal;
      color: var(--text-color-secondary);
      font-weight: 400;
    }

    .pp-row {
      display: grid;
      grid-template-columns: 1fr;
      gap: 3rem;
      align-items: center;
      padding: 3rem 0;
    }
    @media (min-width: 1024px) {
      .pp-row {
        grid-template-columns: 1fr 1fr;
        gap: 5rem;
      }
      .pp-row--right .pp-row-text  { order: 1; }
      .pp-row--right .pp-row-visual { order: 2; }
    }

    .pp-block-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: color-mix(in srgb, var(--primary-color) 12%, transparent);
      border: 1px solid color-mix(in srgb, var(--primary-color) 24%, transparent);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.25rem;
    }
    .pp-block-icon i { font-size: 1.25rem; color: var(--primary-color); }

    .pp-block-title {
      margin: 0 0 1rem;
      font-size: clamp(1.5rem, 2.5vw, 2rem);
      font-weight: 600;
      letter-spacing: -0.02em;
      line-height: 1.15;
      color: var(--text-color);
    }
    .pp-block-desc {
      margin: 0 0 1.25rem;
      font-size: 1rem;
      color: var(--text-color-secondary);
      line-height: 1.55;
      max-width: 32rem;
    }
    .pp-block-list {
      margin: 0;
      padding: 0;
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .pp-block-list li {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      font-size: 0.9375rem;
      color: var(--text-color);
    }
    .pp-block-list i {
      font-size: 0.6875rem;
      color: var(--primary-color);
      width: 18px; height: 18px;
      border-radius: 50%;
      background: color-mix(in srgb, var(--primary-color) 15%, transparent);
      display: inline-flex; align-items: center; justify-content: center;
    }

    /* ─── Mockups ─── */
    .pp-mock {
      background: var(--pp-surface);
      border: 1px solid var(--pp-border);
      border-radius: 16px;
      padding: 1.25rem;
      box-shadow: 0 24px 60px -20px var(--pp-shadow);
      display: flex;
      flex-direction: column;
      gap: 0.875rem;
    }

    .pp-mock-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--pp-border-subtle);
    }
    .pp-mock-kicker {
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: 0.6875rem;
      color: var(--pp-text-3);
      letter-spacing: 0.08em;
    }
    .pp-mock-live {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.6875rem;
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      color: #34d399;
      letter-spacing: 0.05em;
    }
    .pp-mock-livedot {
      width: 7px; height: 7px;
      border-radius: 50%;
      background: #34d399;
      box-shadow: 0 0 0 3px rgba(52,211,153,0.2);
      animation: pp-pulse-h 2s infinite;
    }
    @keyframes pp-pulse-h {
      0%, 100% { box-shadow: 0 0 0 3px rgba(52,211,153,0.2); }
      50%      { box-shadow: 0 0 0 6px rgba(52,211,153,0); }
    }

    /* SRI rows */
    .pp-mock-rows { display: flex; flex-direction: column; gap: 0.375rem; }
    .pp-mock-row {
      display: grid;
      grid-template-columns: 130px 1fr auto 70px;
      gap: 0.75rem;
      align-items: center;
      padding: 0.5rem 0.625rem;
      border-radius: 8px;
      background: var(--pp-surface-2);
      font-size: 0.8125rem;
    }
    .pp-mock-mono {
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: 0.6875rem;
      color: var(--pp-text-3);
    }
    .pp-mock-name { color: var(--text-color); font-weight: 500; }
    .pp-mock-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.125rem 0.5rem;
      border-radius: 999px;
      font-size: 0.6875rem;
      font-weight: 500;
    }
    .pp-mock-badge--ok { background: rgba(52,211,153,0.12); color: #34d399; }
    .pp-mock-badge--proc {
      background: color-mix(in srgb, var(--primary-color) 12%, transparent);
      color: var(--primary-color);
    }
    .pp-mock-amt {
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-feature-settings: 'tnum';
      text-align: right;
      font-weight: 600;
      color: var(--text-color);
    }
    .pp-mock-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 0.625rem;
      border-top: 1px solid var(--pp-border-subtle);
      font-size: 0.75rem;
      color: var(--pp-text-3);
      font-family: 'JetBrains Mono', ui-monospace, monospace;
    }
    .pp-mock-footer strong {
      color: #34d399;
      font-weight: 600;
    }

    /* Inventory bars */
    .pp-mock-bars { display: flex; flex-direction: column; gap: 0.75rem; }
    .pp-mock-bar { display: flex; flex-direction: column; gap: 0.375rem; }
    .pp-mock-bar-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.8125rem;
      color: var(--text-color);
    }
    .pp-mock-bar-num {
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      color: var(--pp-text-3);
      font-size: 0.75rem;
    }
    .pp-mock-bar-track {
      height: 4px;
      background: var(--pp-surface-2);
      border-radius: 2px;
      overflow: hidden;
    }
    .pp-mock-bar-fill {
      height: 100%;
      background: var(--primary-color);
      border-radius: 2px;
    }
    .pp-mock-bar-fill--warn { background: #f59e0b; }
    .pp-mock-bar-fill--danger { background: #ef4444; }

    .pp-mock-go {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 100%;
      height: 38px;
      padding: 0 1rem;
      border: 1px solid color-mix(in srgb, var(--primary-color) 28%, transparent);
      background: color-mix(in srgb, var(--primary-color) 10%, transparent);
      color: var(--primary-color);
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.8125rem;
      cursor: pointer;
      transition: background 0.15s;
    }
    .pp-mock-go:hover {
      background: color-mix(in srgb, var(--primary-color) 18%, transparent);
    }
    .pp-mock-go i { font-size: 0.6875rem; }
  `]
})
export class HighlightsWidget {}
