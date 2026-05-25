import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Feature {
  icon: string;
  title: string;
  desc: string;
}

@Component({
  selector: 'app-features-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="features" class="pp-features">
      <div class="pp-features-head">
        <div class="pp-kicker">CARACTERÍSTICAS</div>
        <h2 class="pp-h2">Todo lo que tu negocio necesita,<br /><em>en un solo lugar.</em></h2>
        <p class="pp-sub">
          Ventas, inventario, facturación electrónica y reportes. Sin módulos extra, sin sorpresas.
        </p>
      </div>

      <div class="pp-features-grid">
        @for (f of features; track f.title) {
          <div class="pp-feature-card">
            <div class="pp-feature-icon">
              <i class="pi" [ngClass]="f.icon"></i>
            </div>
            <h3 class="pp-feature-title">{{ f.title }}</h3>
            <p class="pp-feature-desc">{{ f.desc }}</p>
          </div>
        }
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }

    .pp-features {
      padding: 6rem 1.5rem;
      max-width: 1280px;
      margin: 0 auto;
    }
    @media (min-width: 1024px) {
      .pp-features { padding: 8rem 5rem; }
    }

    .pp-features-head {
      max-width: 36rem;
      margin: 0 auto 4rem;
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
      margin: 0 0 1rem;
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
    .pp-sub {
      margin: 0;
      font-size: 1rem;
      color: var(--text-color-secondary);
      line-height: 1.55;
    }

    .pp-features-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;
    }
    @media (min-width: 640px)  { .pp-features-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (min-width: 1024px) { .pp-features-grid { grid-template-columns: repeat(3, 1fr); } }

    .pp-feature-card {
      position: relative;
      padding: 1.75rem;
      background: var(--pp-surface);
      border: 1px solid var(--pp-border);
      border-radius: 14px;
      transition: border-color 0.18s, transform 0.18s;
    }
    .pp-feature-card:hover {
      border-color: color-mix(in srgb, var(--primary-color) 40%, var(--pp-border));
      transform: translateY(-2px);
    }
    .pp-feature-card::before {
      content: '';
      position: absolute;
      top: 0; left: 1.75rem; right: 1.75rem;
      height: 1px;
      background: linear-gradient(90deg,
        transparent,
        color-mix(in srgb, var(--primary-color) 50%, transparent),
        transparent);
      opacity: 0;
      transition: opacity 0.18s;
    }
    .pp-feature-card:hover::before { opacity: 1; }

    .pp-feature-icon {
      width: 42px;
      height: 42px;
      border-radius: 10px;
      background: color-mix(in srgb, var(--primary-color) 10%, transparent);
      border: 1px solid color-mix(in srgb, var(--primary-color) 22%, transparent);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.25rem;
    }
    .pp-feature-icon i {
      font-size: 1.125rem;
      color: var(--primary-color);
    }

    .pp-feature-title {
      margin: 0 0 0.5rem;
      font-size: 1rem;
      font-weight: 600;
      letter-spacing: -0.01em;
      color: var(--text-color);
    }
    .pp-feature-desc {
      margin: 0;
      font-size: 0.875rem;
      color: var(--text-color-secondary);
      line-height: 1.55;
    }
  `]
})
export class FeaturesWidget {
  features: Feature[] = [
    { icon: 'pi-file-check',     title: 'Facturación SRI',         desc: 'Comprobantes electrónicos autorizados y firmados en segundos, con manejo automático de errores y reintentos.' },
    { icon: 'pi-shopping-cart',  title: 'Punto de venta rápido',   desc: 'POS optimizado para teclado y código de barras. Cobrar y facturar en menos de 30 segundos.' },
    { icon: 'pi-box',            title: 'Inventario en tiempo real', desc: 'Stock sincronizado entre sucursales. Alertas de mínimos y orden de compra automática.' },
    { icon: 'pi-chart-line',     title: 'Reportes que importan',   desc: 'Ventas por hora, top productos, márgenes y proyecciones. Sin armar planillas.' },
    { icon: 'pi-users',          title: 'Clientes y proveedores',  desc: 'Validación de RUC y cédula. Historial completo, créditos y notas asociadas.' },
    { icon: 'pi-shield',         title: 'Roles y permisos',        desc: 'Cada cargo ve lo que necesita. Doble factor opcional y registro de auditoría.' },
    { icon: 'pi-mobile',         title: 'Trabaja en cualquier dispositivo', desc: 'Funciona en PC, tablet y móvil. Sigue vendiendo aunque se caiga Internet.' },
    { icon: 'pi-bolt',           title: 'Configuración en minutos',desc: 'Empieza con plantillas locales. Sin instaladores, sin servidores, sin licencias.' },
    { icon: 'pi-lock',           title: 'Datos protegidos',         desc: 'Cifrado 256-bit, respaldos automáticos diarios y centros de datos en la región.' },
  ];
}
