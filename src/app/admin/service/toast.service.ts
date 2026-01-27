import { inject, Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class ToastService {

  private messageService = inject(MessageService);

  success(detail: string, summary = 'Éxito') {
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail,
      life: 3000
    });
  }

  error(detail: string, summary = 'Error') {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail,
      life: 3000
    });
  }

  warn(detail: string, summary = 'Advertencia') {
    this.messageService.add({
      severity: 'warn',
      summary: 'Advertencia',
      detail,
      life: 3000
    });
  }

  info(detail: string, summary = 'Información') {
    this.messageService.add({
      severity: 'info',
      summary: 'Información',
      detail,
      life: 3000
    });
  }

  clear() {
    this.messageService.clear();
  }

}
