import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { ToastService } from './admin/service/toast.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toast],
  template: `
  <p-toast position="bottom-left" (click)=" this.toast.clear()"></p-toast>
  <router-outlet></router-outlet>`,
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('punto-pop');
  toast = inject(ToastService);
}
