import { inject, Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class ToastService {

  private messageService = inject(MessageService);

  success(detail: string, summary: string = 'Éxito') {
    this.messageService.add({
      severity: 'success',
      summary,
      detail,
      life: 3000
    });
  }

  error(detail: string, summary: string = 'Error') {
    this.messageService.add({
      severity: 'error',
      summary,
      detail,
      life: 3000
    });
  }

  warn(detail: string, summary: string = 'Advertencia') {
    this.messageService.add({
      severity: 'warn',
      summary,
      detail,
      life: 3000
    });
  }

  info(detail: string, summary: string = 'Información') {
    this.messageService.add({
      severity: 'info',
      summary,
      detail,
      life: 3000
    });
  }

  clear() {
    this.messageService.clear();
  }

}
