import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toast],
  template: `
  <p-toast position="bottom-left" (click)="clear()"></p-toast>
  <router-outlet></router-outlet>`,
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('punto-pop');
  private messageService = inject(MessageService);

  clear() {
    this.messageService.clear();
  }
}
