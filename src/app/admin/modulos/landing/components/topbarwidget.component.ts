import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { AppFloatingConfigurator } from '../../../component/floatingconfigurator/app.floatingconfigurator';

@Component({
  selector: 'app-topbar-widget',
  standalone: true,
  imports: [CommonModule, RouterModule, StyleClassModule, ButtonModule, RippleModule, AppFloatingConfigurator],
  template: `
    <a routerLink="/" fragment="home" class="pp-brand">
      <span class="pp-brand-mark" aria-hidden="true">
        <svg viewBox="0 0 32 32" fill="none">
          <rect x="1" y="1" width="30" height="30" rx="8" fill="var(--primary-color)" />
          <circle cx="16" cy="16" r="9" fill="none" stroke="rgba(10,11,20,0.85)" stroke-width="1.5" />
          <circle cx="16" cy="16" r="3" fill="rgba(10,11,20,0.9)" />
        </svg>
      </span>
      <span class="pp-brand-text">Punto<em>Pop</em></span>
    </a>

    <a pButton [text]="true" severity="secondary" [rounded]="true" pRipple class="lg:hidden!"
       pStyleClass="@next" enterFromClass="hidden" leaveToClass="hidden" [hideOnOutsideClick]="true">
      <i class="pi pi-bars text-2xl!"></i>
    </a>

    <div class="items-center bg-surface-0 dark:bg-surface-900 grow justify-between hidden lg:flex absolute lg:static w-full left-0 top-full px-12 lg:px-0 z-20 rounded-border">
      <ul class="pp-nav list-none p-0 m-0 flex lg:items-center select-none flex-col lg:flex-row cursor-pointer gap-8">
        <li><button (click)="router.navigate(['/landing'], { fragment: 'home' })" pRipple>Inicio</button></li>
        <li><button (click)="router.navigate(['/landing'], { fragment: 'features' })" pRipple>Producto</button></li>
        <li><button (click)="router.navigate(['/landing'], { fragment: 'highlights' })" pRipple>Facturación SRI</button></li>
        <li><button (click)="router.navigate(['/landing'], { fragment: 'pricing' })" pRipple>Precios</button></li>
      </ul>
      <div class="flex border-t lg:border-t-0 border-surface py-4 lg:py-0 mt-4 lg:mt-0 gap-2 items-center">
        <button pButton pRipple label="Iniciar sesión" routerLink="/auth/login" [rounded]="true" [text]="true"></button>
        <button pButton pRipple label="Probar gratis" routerLink="/auth/login" [rounded]="true"></button>
        <app-floating-configurator [float]="false" />
      </div>
    </div>
  `,
  styles: [`
    :host { display: contents; }
    .pp-brand {
      display: inline-flex;
      align-items: center;
      gap: 0.625rem;
      text-decoration: none;
      cursor: pointer;
    }
    .pp-brand-mark svg { width: 32px; height: 32px; display: block; }
    .pp-brand-text {
      font-size: 1.05rem;
      font-weight: 600;
      letter-spacing: -0.015em;
      color: var(--text-color);
      line-height: 1;
    }
    .pp-brand-text em {
      font-style: normal;
      color: var(--primary-color);
    }
    .pp-nav button {
      padding: 0;
      background: transparent;
      border: 0;
      color: var(--text-color-secondary);
      font-size: 0.9375rem;
      font-weight: 450;
      cursor: pointer;
      transition: color 0.14s ease;
    }
    .pp-nav button:hover {
      color: var(--text-color);
    }
  `]
})
export class TopbarWidget {
  public router = inject(Router);
}
