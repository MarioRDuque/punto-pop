import { Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-footer',
  template: `
    <div class="layout-footer">
      <span class="pp-footer-dot" aria-hidden="true"></span>
      <span class="pp-footer-status">Sistema operativo · SRI conectado</span>
      <span class="pp-footer-sep">·</span>
      <span>Punto Pop {{ year }} · v1.0.0</span>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .layout-footer {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      justify-content: center;
      padding: 0.875rem 1rem;
      border-top: 1px solid var(--pp-border-subtle);
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: 0.6875rem;
      color: var(--pp-text-3);
      letter-spacing: 0.06em;
      text-transform: uppercase;
      background: transparent;
    }
    .pp-footer-dot {
      width: 7px; height: 7px;
      border-radius: 50%;
      background: #34d399;
      box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.22);
      animation: pp-footer-pulse 2s infinite;
    }
    @keyframes pp-footer-pulse {
      0%, 100% { box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.22); }
      50%      { box-shadow: 0 0 0 6px rgba(52, 211, 153, 0); }
    }
    .pp-footer-status { color: #34d399; }
    .pp-footer-sep { opacity: 0.5; }
  `]
})
export class AppFooter {
  year = new Date().getFullYear();
}
