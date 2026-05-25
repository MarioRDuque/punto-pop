import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  desc: string;
  cta: string;
  featured?: boolean;
  features: string[];
}

@Component({
  selector: 'app-pricing-widget',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, RippleModule],
  template: `
    <section id="pricing" class="pp-pricing">
      <div class="pp-pricing-head">
        <div class="pp-kicker">PLANES</div>
        <h2 class="pp-h2">Precio honesto.<br /><em>Sin sorpresas en la factura.</em></h2>
        <p class="pp-sub">
          Todos los planes incluyen facturación SRI ilimitada y soporte humano en español.
          Cancela cuando quieras.
        </p>
      </div>

      <div class="pp-plans">
        @for (p of plans; track p.id) {
          <div class="pp-plan" [class.pp-plan--featured]="p.featured">
            @if (p.featured) {
              <span class="pp-plan-tag">MÁS POPULAR</span>
            }
            <div class="pp-plan-head">
              <h3 class="pp-plan-name">{{ p.name }}</h3>
              <p class="pp-plan-desc">{{ p.desc }}</p>
            </div>
            <div class="pp-plan-price">
              <span class="pp-plan-currency">$</span>
              <span class="pp-plan-amount">{{ p.price }}</span>
              <span class="pp-plan-period">/ {{ p.period }}</span>
            </div>
            <button pButton pRipple
                    [routerLink]="['/auth/login']"
                    [rounded]="true"
                    [outlined]="!p.featured"
                    [label]="p.cta"
                    class="pp-plan-cta"></button>
            <ul class="pp-plan-features">
              @for (f of p.features; track f) {
                <li><i class="pi pi-check"></i><span>{{ f }}</span></li>
              }
            </ul>
          </div>
        }
      </div>

      <p class="pp-pricing-foot">
        ¿Necesitas más sucursales o usuarios? <a routerLink="/auth/login">Hablemos →</a>
      </p>
    </section>
  `,
  styles: [`
    :host { display: block; }

    .pp-pricing {
      padding: 6rem 1.5rem;
      max-width: 1280px;
      margin: 0 auto;
    }
    @media (min-width: 1024px) {
      .pp-pricing { padding: 8rem 5rem; }
    }

    .pp-pricing-head {
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
    .pp-h2 em { font-style: normal; color: var(--text-color-secondary); font-weight: 400; }
    .pp-sub {
      margin: 0;
      font-size: 1rem;
      color: var(--text-color-secondary);
      line-height: 1.55;
    }

    .pp-plans {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;
    }
    @media (min-width: 1024px) {
      .pp-plans { grid-template-columns: repeat(3, 1fr); align-items: stretch; }
    }

    .pp-plan {
      position: relative;
      padding: 2rem;
      background: var(--pp-surface);
      border: 1px solid var(--pp-border);
      border-radius: 16px;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      transition: border-color 0.18s, transform 0.18s;
    }
    .pp-plan:hover {
      border-color: color-mix(in srgb, var(--primary-color) 40%, var(--pp-border));
      transform: translateY(-2px);
    }
    .pp-plan--featured {
      border-color: var(--primary-color);
      background: linear-gradient(180deg,
        color-mix(in srgb, var(--primary-color) 6%, var(--pp-surface)),
        var(--pp-surface));
      box-shadow: 0 12px 40px -12px color-mix(in srgb, var(--primary-color) 35%, transparent);
    }
    .pp-plan--featured:hover { border-color: var(--primary-color); }
    .pp-plan-tag {
      position: absolute;
      top: -10px; left: 2rem;
      background: var(--primary-color);
      color: #fff;
      font-size: 0.6875rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      padding: 0.25rem 0.625rem;
      border-radius: 999px;
      font-family: 'JetBrains Mono', ui-monospace, monospace;
    }

    .pp-plan-head { display: flex; flex-direction: column; gap: 0.375rem; }
    .pp-plan-name {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
      letter-spacing: -0.01em;
      color: var(--text-color);
    }
    .pp-plan-desc {
      margin: 0;
      font-size: 0.875rem;
      color: var(--text-color-secondary);
      line-height: 1.5;
    }

    .pp-plan-price {
      display: flex;
      align-items: baseline;
      gap: 0.25rem;
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-feature-settings: 'tnum';
    }
    .pp-plan-currency {
      font-size: 1.5rem;
      color: var(--pp-text-3);
      font-weight: 500;
    }
    .pp-plan-amount {
      font-size: 3rem;
      font-weight: 600;
      letter-spacing: -0.03em;
      color: var(--text-color);
      line-height: 1;
    }
    .pp-plan-period {
      font-size: 0.875rem;
      color: var(--pp-text-3);
      margin-left: 0.25rem;
    }

    ::ng-deep .pp-plan-cta {
      width: 100% !important;
      height: 44px !important;
      font-weight: 600 !important;
    }

    .pp-plan-features {
      margin: 0;
      padding: 1.25rem 0 0;
      list-style: none;
      border-top: 1px solid var(--pp-border-subtle);
      display: flex;
      flex-direction: column;
      gap: 0.625rem;
    }
    .pp-plan-features li {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      font-size: 0.875rem;
      color: var(--text-color);
    }
    .pp-plan-features i {
      font-size: 0.625rem;
      color: var(--primary-color);
      width: 18px; height: 18px;
      border-radius: 50%;
      background: color-mix(in srgb, var(--primary-color) 12%, transparent);
      display: inline-flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }

    .pp-pricing-foot {
      margin: 3rem 0 0;
      text-align: center;
      font-size: 0.9375rem;
      color: var(--text-color-secondary);
    }
    .pp-pricing-foot a {
      color: var(--primary-color);
      text-decoration: none;
      font-weight: 500;
    }
    .pp-pricing-foot a:hover { text-decoration: underline; }
  `]
})
export class PricingWidget {
  plans: Plan[] = [
    {
      id: 'mono',
      name: 'Mono',
      price: '0',
      period: 'mes',
      desc: 'Para emprendedores que recién empiezan.',
      cta: 'Empezar gratis',
      features: [
        '1 usuario · 1 sucursal',
        '50 comprobantes SRI / mes',
        'Inventario básico',
        'Soporte por email'
      ]
    },
    {
      id: 'pyme',
      name: 'PYME',
      price: '29',
      period: 'mes',
      desc: 'Para negocios que crecen rápido.',
      cta: 'Probar 14 días',
      featured: true,
      features: [
        'Hasta 5 usuarios · 2 sucursales',
        'Comprobantes SRI ilimitados',
        'Inventario y compras avanzado',
        'Reportes y dashboard',
        'Soporte por chat en horario laboral'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '79',
      period: 'mes',
      desc: 'Para cadenas y franquicias.',
      cta: 'Contactar ventas',
      features: [
        'Usuarios y sucursales ilimitados',
        'API y webhooks',
        'Doble factor obligatorio',
        'SLA 99.95% con soporte 24/7',
        'Onboarding y capacitación dedicada'
      ]
    }
  ];
}
