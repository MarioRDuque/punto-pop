import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { AppFloatingConfigurator } from '../../../component/floatingconfigurator/app.floatingconfigurator';

@Component({
  selector: 'app-access',
  standalone: true,
  imports: [ButtonModule, RouterModule, RippleModule, AppFloatingConfigurator],
  templateUrl: './access.html',
  styleUrl: '../auth-error-pages.scss'
})
export class Access {}
