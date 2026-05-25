import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'app-hero-widget',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, RippleModule],
  template: `
    <section id="hero" class="pp-hero">
      <!-- decorative bg -->
      <div class="pp-hero-bg" aria-hidden="true">
        <div class="pp-hero-grid"></div>
        <div class="pp-hero-aurora pp-hero-aurora--a"></div>
        <div class="pp-hero-aurora pp-hero-aurora--b"></div>
      </div>

      <div class="pp-hero-inner">
        <div class="pp-hero-content">
          <a class="pp-pill" routerLink="/auth/login">
            <span class="pp-pill__badge">NUEVO</span>
            <span>Facturación SRI 2.0 · firmas en lote</span>
            <i class="pi pi-arrow-right"></i>
          </a>

          <h1 class="pp-hero-title">
            El sistema<br />
            <span class="pp-hero-title-dim">operativo de</span><br />
            tu punto de venta.
          </h1>

          <p class="pp-hero-lead">
            Punto Pop reúne ventas, inventario, facturación electrónica SRI y reportes
            en una superficie limpia. Diseñado para que tu equipo venda más, sin pelear con software.
          </p>

          <div class="pp-hero-cta">
            <button pButton pRipple routerLink="/auth/login" [rounded]="true"
                    class="pp-btn-hero"
                    label="Empezar gratis 14 días"
                    icon="pi pi-bolt"></button>
            <button pButton pRipple [rounded]="true" [outlined]="true"
                    class="pp-btn-hero pp-btn-hero--ghost"
                    label="Ver demo en vivo"></button>
          </div>

          <div class="pp-hero-trust">
            <div class="pp-trust-item">
              <span class="pp-trust-dot"></span>
              <span>SRI en línea</span>
            </div>
            <div class="pp-trust-sep"></div>
            <div class="pp-trust-item">
              <strong>1,847</strong><span>negocios facturando hoy</span>
            </div>
            <div class="pp-trust-sep"></div>
            <div class="pp-trust-item">
              <strong>99.9%</strong><span>uptime · 30 días</span>
            </div>
          </div>
        </div>

        <!-- App preview mock -->
        <div class="pp-hero-preview" aria-hidden="true">
          <div class="pp-preview-glow"></div>
          <div class="pp-preview-window">
            <div class="pp-preview-chrome">
              <span class="pp-preview-dot"></span>
              <span class="pp-preview-dot"></span>
              <span class="pp-preview-dot"></span>
              <span class="pp-preview-url">app.puntopop.ec/ventas/nueva</span>
            </div>
            <div class="pp-preview-body">
              <div class="pp-preview-head">
                <div>
                  <div class="pp-preview-kicker">NUEVA VENTA</div>
                  <div class="pp-preview-customer">Carla Mendoza <em>· RUC 1792…001</em></div>
                </div>
                <span class="pp-preview-badge">
                  <span class="pp-preview-live"></span>En curso
                </span>
              </div>
              <div class="pp-preview-table">
                <div class="pp-preview-row">
                  <span class="pp-preview-sku">QUE-MOZ-200</span>
                  <span class="pp-preview-name">Queso mozzarella · 200g</span>
                  <span class="pp-preview-num">×3</span>
                  <span class="pp-preview-num pp-preview-bold">$13.50</span>
                </div>
                <div class="pp-preview-row">
                  <span class="pp-preview-sku">PAN-INT-500</span>
                  <span class="pp-preview-name">Pan integral · 500g</span>
                  <span class="pp-preview-num">×2</span>
                  <span class="pp-preview-num pp-preview-bold">$4.20</span>
                </div>
                <div class="pp-preview-row">
                  <span class="pp-preview-sku">JUG-NAR-1L</span>
                  <span class="pp-preview-name">Jugo de naranja · 1L</span>
                  <span class="pp-preview-num">×1</span>
                  <span class="pp-preview-num pp-preview-bold">$3.85</span>
                </div>
              </div>
              <div class="pp-preview-total">
                <div class="pp-preview-totcol">
                  <span>SUBTOTAL</span>
                  <strong>$21.55</strong>
                </div>
                <div class="pp-preview-totcol">
                  <span>IVA 15%</span>
                  <strong>$3.23</strong>
                </div>
                <div class="pp-preview-totcol pp-preview-totcol--final">
                  <span>TOTAL</span>
                  <strong>$24.78</strong>
                </div>
                <button class="pp-preview-go">Facturar <i class="pi pi-arrow-right"></i></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }

    .pp-hero {
      position: relative;
      padding: 1.5rem 1.5rem 4rem;
      overflow: hidden;
    }
    @media (min-width: 1024px) {
      .pp-hero { padding: 2rem 5rem 6rem; }
    }

    .pp-hero-bg {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 0;
    }
    .pp-hero-grid {
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(var(--pp-border-subtle) 1px, transparent 1px),
        linear-gradient(90deg, var(--pp-border-subtle) 1px, transparent 1px);
      background-size: 48px 48px;
      mask-image: radial-gradient(ellipse 80% 60% at 50% 30%, #000 30%, transparent 80%);
      -webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 30%, #000 30%, transparent 80%);
    }
    .pp-hero-aurora {
      position: absolute;
      border-radius: 50%;
      filter: blur(60px);
      opacity: 0.55;
    }
    .pp-hero-aurora--a {
      top: -150px;
      right: -100px;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, color-mix(in srgb, var(--primary-color) 35%, transparent), transparent 65%);
    }
    .pp-hero-aurora--b {
      bottom: -200px;
      left: -100px;
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, color-mix(in srgb, var(--primary-color) 18%, transparent), transparent 70%);
    }

    .pp-hero-inner {
      position: relative;
      z-index: 1;
      display: grid;
      grid-template-columns: 1fr;
      gap: 3rem;
      align-items: center;
      max-width: 1280px;
      margin: 0 auto;
    }
    @media (min-width: 1024px) {
      .pp-hero-inner { grid-template-columns: 1.05fr 1fr; gap: 4rem; padding-top: 2rem; }
    }

    /* Pill */
    .pp-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.375rem 0.75rem 0.375rem 0.375rem;
      background: var(--pp-surface);
      border: 1px solid var(--pp-border);
      border-radius: 999px;
      margin-bottom: 1.75rem;
      text-decoration: none;
      color: var(--text-color-secondary);
      font-size: 0.8125rem;
      transition: border-color 0.15s;
    }
    .pp-pill:hover { border-color: var(--primary-color); }
    .pp-pill__badge {
      padding: 0.125rem 0.5rem;
      background: color-mix(in srgb, var(--primary-color) 18%, transparent);
      color: var(--primary-color);
      border-radius: 999px;
      font-size: 0.6875rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      font-family: 'JetBrains Mono', ui-monospace, monospace;
    }
    .pp-pill i { font-size: 0.6875rem; color: var(--pp-text-3); }

    /* Title */
    .pp-hero-title {
      margin: 0 0 1.75rem;
      font-size: clamp(2.5rem, 5vw, 4.5rem);
      font-weight: 600;
      line-height: 1;
      letter-spacing: -0.035em;
      color: var(--text-color);
    }
    .pp-hero-title-dim {
      color: var(--text-color-secondary);
      font-weight: 400;
    }

    /* Lead */
    .pp-hero-lead {
      margin: 0 0 2.25rem;
      font-size: 1.0625rem;
      color: var(--text-color-secondary);
      line-height: 1.55;
      max-width: 30rem;
    }

    /* CTAs */
    .pp-hero-cta {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-bottom: 2.75rem;
    }
    ::ng-deep .pp-btn-hero {
      height: 46px !important;
      padding: 0 1.25rem !important;
      font-weight: 600 !important;
      font-size: 0.9rem !important;
    }
    ::ng-deep .pp-btn-hero.pp-btn-hero--ghost {
      background: transparent !important;
    }

    /* Trust row */
    .pp-hero-trust {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      flex-wrap: wrap;
    }
    .pp-trust-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
      color: var(--text-color-secondary);
      font-family: 'Inter', sans-serif;
    }
    .pp-trust-item strong {
      color: var(--text-color);
      font-weight: 600;
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-feature-settings: 'tnum';
    }
    .pp-trust-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: #34d399;
      box-shadow: 0 0 0 3px rgba(52,211,153,0.2);
      animation: pp-pulse-trust 2s infinite;
    }
    @keyframes pp-pulse-trust {
      0%, 100% { box-shadow: 0 0 0 3px rgba(52,211,153,0.2); }
      50%      { box-shadow: 0 0 0 6px rgba(52,211,153,0); }
    }
    .pp-trust-sep {
      width: 1px; height: 14px;
      background: var(--pp-border);
    }

    /* ─── Preview card ─────────── */
    .pp-hero-preview {
      position: relative;
      transform: perspective(2000px) rotateY(-7deg) rotateX(3deg);
      transform-origin: center;
    }
    @media (max-width: 1023px) {
      .pp-hero-preview { transform: none; }
    }
    .pp-preview-glow {
      position: absolute;
      inset: -40px;
      background: radial-gradient(circle, color-mix(in srgb, var(--primary-color) 30%, transparent), transparent 65%);
      filter: blur(40px);
      opacity: 0.55;
      pointer-events: none;
    }
    .pp-preview-window {
      position: relative;
      background: var(--pp-surface);
      border: 1px solid var(--pp-border);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 60px 120px -30px var(--pp-shadow-lg), 0 0 0 1px var(--pp-border-subtle);
    }
    .pp-preview-chrome {
      height: 36px;
      background: var(--pp-surface-2);
      border-bottom: 1px solid var(--pp-border-subtle);
      padding: 0 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .pp-preview-dot {
      width: 11px; height: 11px;
      border-radius: 50%;
      background: var(--pp-text-4);
    }
    .pp-preview-dot:first-child { background: #fb7185; }
    .pp-preview-dot:nth-child(2) { background: #fbbf24; }
    .pp-preview-dot:nth-child(3) { background: #34d399; }
    .pp-preview-url {
      flex: 1;
      text-align: center;
      font-size: 11px;
      color: var(--pp-text-3);
      font-family: 'JetBrains Mono', ui-monospace, monospace;
    }

    .pp-preview-body {
      padding: 18px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .pp-preview-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .pp-preview-kicker {
      font-size: 10px;
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      color: var(--pp-text-3);
      letter-spacing: 0.08em;
    }
    .pp-preview-customer {
      font-size: 14px;
      font-weight: 600;
      margin-top: 4px;
      color: var(--text-color);
    }
    .pp-preview-customer em {
      font-style: normal;
      color: var(--pp-text-3);
      font-weight: 400;
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: 12px;
    }
    .pp-preview-badge {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 3px 9px;
      background: color-mix(in srgb, var(--primary-color) 12%, transparent);
      color: var(--primary-color);
      border-radius: 999px;
      font-size: 11px; font-weight: 500;
    }
    .pp-preview-live {
      width: 6px; height: 6px; border-radius: 50%;
      background: currentColor;
      animation: pp-pulse-trust 2s infinite;
    }

    .pp-preview-table {
      background: var(--pp-surface-2);
      border: 1px solid var(--pp-border-subtle);
      border-radius: 10px;
      overflow: hidden;
    }
    .pp-preview-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      font-size: 12.5px;
      border-bottom: 1px solid var(--pp-border-subtle);
    }
    .pp-preview-row:last-child { border-bottom: 0; }
    .pp-preview-sku {
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: 10.5px;
      color: var(--pp-text-3);
      width: 90px;
    }
    .pp-preview-name { flex: 1; color: var(--text-color); }
    .pp-preview-num {
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      color: var(--pp-text-3);
      font-feature-settings: 'tnum';
    }
    .pp-preview-bold {
      color: var(--text-color);
      font-weight: 600;
      width: 56px;
      text-align: right;
    }

    .pp-preview-total {
      background: var(--pp-surface-2);
      border: 1px solid var(--pp-border-subtle);
      border-radius: 10px;
      padding: 14px 16px;
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }
    .pp-preview-totcol {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .pp-preview-totcol span {
      font-size: 10.5px;
      color: var(--pp-text-3);
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      letter-spacing: 0.06em;
    }
    .pp-preview-totcol strong {
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: 15px;
      font-weight: 500;
      color: var(--text-color);
      font-feature-settings: 'tnum';
    }
    .pp-preview-totcol--final { flex: 1; }
    .pp-preview-totcol--final strong { font-size: 22px; font-weight: 600; }

    .pp-preview-go {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      height: 36px;
      padding: 0 14px;
      border: 0;
      border-radius: 8px;
      background: var(--primary-color);
      color: #fff;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      box-shadow: 0 6px 16px -4px color-mix(in srgb, var(--primary-color) 50%, transparent);
    }
    .pp-preview-go i { font-size: 11px; }
  `]
})
export class HeroWidget {}
