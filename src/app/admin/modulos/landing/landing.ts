import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RippleModule } from 'primeng/ripple';
import { StyleClassModule } from 'primeng/styleclass';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TopbarWidget } from './components/topbarwidget.component';
import { HeroWidget } from './components/herowidget';
import { FeaturesWidget } from './components/featureswidget';
import { HighlightsWidget } from './components/highlightswidget';
import { PricingWidget } from './components/pricingwidget';
import { FooterWidget } from './components/footerwidget';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    RouterModule,
    TopbarWidget,
    HeroWidget,
    FeaturesWidget,
    HighlightsWidget,
    PricingWidget,
    FooterWidget,
    RippleModule,
    StyleClassModule,
    ButtonModule,
    DividerModule
  ],
  template: `
    <div class="pp-landing">
      <div id="home" class="pp-landing-inner">
        <app-topbar-widget class="pp-landing-topbar py-5 px-6 mx-0 lg:mx-20 flex items-center justify-between relative lg:static" />
        <app-hero-widget />
        <app-features-widget />
        <app-highlights-widget />
        <app-pricing-widget />
        <app-footer-widget />
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .pp-landing {
      background: var(--pp-bg);
      color: var(--text-color);
      min-height: 100vh;
    }
    .pp-landing-inner {
      overflow: hidden;
    }
    .pp-landing-topbar {
      max-width: 1280px;
      margin: 0 auto;
    }
  `]
})
export class Landing {}
