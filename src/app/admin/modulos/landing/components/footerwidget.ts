import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer-widget',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="pp-footer">
      <div class="pp-footer-inner">
        <div class="pp-footer-brand">
          <a class="pp-brand" (click)="goHome()">
            <span class="pp-brand-mark" aria-hidden="true">
              <svg viewBox="0 0 32 32" fill="none">
                <rect x="1" y="1" width="30" height="30" rx="8" fill="var(--primary-color)" />
                <circle cx="16" cy="16" r="9" fill="none" stroke="rgba(10,11,20,0.85)" stroke-width="1.5" />
                <circle cx="16" cy="16" r="3" fill="rgba(10,11,20,0.9)" />
              </svg>
            </span>
            <span class="pp-brand-text">Punto<em>Pop</em></span>
          </a>
          <p class="pp-footer-tag">
            El sistema operativo de tu punto de venta.<br />
            Hecho en Ecuador, para Ecuador.
          </p>
          <div class="pp-footer-status">
            <span class="pp-footer-dot"></span>
            <span>Todos los sistemas operativos</span>
          </div>
        </div>

        <div class="pp-footer-cols">
          <div class="pp-footer-col">
            <h4>Producto</h4>
            <a>Punto de venta</a>
            <a>Facturación SRI</a>
            <a>Inventario</a>
            <a>Reportes</a>
            <a routerLink="/auth/login">Iniciar sesión</a>
          </div>
          <div class="pp-footer-col">
            <h4>Empresa</h4>
            <a>Nosotros</a>
            <a>Clientes</a>
            <a>Blog</a>
            <a>Contacto</a>
          </div>
          <div class="pp-footer-col">
            <h4>Recursos</h4>
            <a>Centro de ayuda</a>
            <a>Estado del sistema</a>
            <a>API y webhooks</a>
            <a>Cambios</a>
          </div>
          <div class="pp-footer-col">
            <h4>Legal</h4>
            <a>Términos</a>
            <a>Privacidad</a>
            <a>Política de datos</a>
            <a>Cumplimiento SRI</a>
          </div>
        </div>
      </div>

      <div class="pp-footer-bottom">
        <span>© {{ year }} Punto Pop · Todos los derechos reservados</span>
        <span class="pp-footer-meta">v1.0.0 · Quito, Ecuador</span>
      </div>
    </footer>
  `,
  styles: [`
    :host { display: block; }

    .pp-footer {
      padding: 5rem 1.5rem 2rem;
      max-width: 1280px;
      margin: 0 auto;
      border-top: 1px solid var(--pp-border-subtle);
    }
    @media (min-width: 1024px) {
      .pp-footer { padding: 6rem 5rem 2.5rem; }
    }

    .pp-footer-inner {
      display: grid;
      grid-template-columns: 1fr;
      gap: 3rem;
      margin-bottom: 3rem;
    }
    @media (min-width: 1024px) {
      .pp-footer-inner { grid-template-columns: 1.1fr 2fr; gap: 4rem; }
    }

    .pp-brand {
      display: inline-flex;
      align-items: center;
      gap: 0.625rem;
      text-decoration: none;
      cursor: pointer;
      margin-bottom: 1rem;
    }
    .pp-brand-mark svg { width: 32px; height: 32px; display: block; }
    .pp-brand-text {
      font-size: 1.05rem;
      font-weight: 600;
      letter-spacing: -0.015em;
      color: var(--text-color);
    }
    .pp-brand-text em { font-style: normal; color: var(--primary-color); }

    .pp-footer-tag {
      margin: 0 0 1.25rem;
      font-size: 0.875rem;
      color: var(--text-color-secondary);
      line-height: 1.55;
      max-width: 22rem;
    }

    .pp-footer-status {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.75rem;
      color: var(--text-color-secondary);
      font-family: 'JetBrains Mono', ui-monospace, monospace;
    }
    .pp-footer-dot {
      width: 7px; height: 7px;
      border-radius: 50%;
      background: #34d399;
      box-shadow: 0 0 0 3px rgba(52,211,153,0.2);
    }

    .pp-footer-cols {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 2rem;
    }
    @media (min-width: 768px) {
      .pp-footer-cols { grid-template-columns: repeat(4, 1fr); }
    }
    .pp-footer-col { display: flex; flex-direction: column; gap: 0.625rem; }
    .pp-footer-col h4 {
      margin: 0 0 0.5rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-color);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-family: 'JetBrains Mono', ui-monospace, monospace;
    }
    .pp-footer-col a {
      font-size: 0.875rem;
      color: var(--text-color-secondary);
      text-decoration: none;
      cursor: pointer;
      transition: color 0.12s;
    }
    .pp-footer-col a:hover { color: var(--text-color); }

    .pp-footer-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1.5rem;
      border-top: 1px solid var(--pp-border-subtle);
      font-size: 0.75rem;
      color: var(--pp-text-3);
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .pp-footer-meta {
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      letter-spacing: 0.05em;
    }
  `]
})
export class FooterWidget {
  public router = inject(Router);
  year = new Date().getFullYear();

  goHome() {
    this.router.navigate(['/landing'], { fragment: 'home' });
  }
}
