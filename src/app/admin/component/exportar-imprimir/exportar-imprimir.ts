import { Component, EventEmitter, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-exportar-imprimir',
  standalone: true,
  imports: [ButtonModule, TooltipModule],
  host: {
    class: 'ml-auto flex items-center gap-1',
  },
  template: `
    <p-button icon="pi pi-download" size="small" [text]="true" severity="secondary"
      pTooltip="Exportar" tooltipPosition="top"
      (onClick)="exportar.emit()" />
    <p-button icon="pi pi-print" size="small" [text]="true" severity="secondary"
      pTooltip="Imprimir" tooltipPosition="top"
      (onClick)="imprimir.emit()" />
  `,
})
export class ExportarImprimir {
  @Output() exportar = new EventEmitter<void>();
  @Output() imprimir = new EventEmitter<void>();
}
