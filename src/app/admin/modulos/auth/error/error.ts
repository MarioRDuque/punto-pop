import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { AppFloatingConfigurator } from '../../../component/floatingconfigurator/app.floatingconfigurator';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [ButtonModule, RippleModule, RouterModule, AppFloatingConfigurator],
  templateUrl: './error.html',
  styleUrl: '../auth-error-pages.scss'
})
export class Error {}
