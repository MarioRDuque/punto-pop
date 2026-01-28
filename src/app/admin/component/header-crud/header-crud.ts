import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { FormsData } from '../../service/forms-data';

@Component({
  selector: 'app-header-crud',
  imports: [ButtonModule, CommonModule, PanelModule, TooltipModule],
  templateUrl: './header-crud.html',
  styleUrl: './header-crud.scss',
})
export class HeaderCrud {

  @Input() titulo!: string;
  @Input() subtitulo!: string;
  @Input() esFormulario = false;
  @Output() mostrarFiltro = new EventEmitter;
  tabsState = inject(FormsData);
  icons: string = "pi pi-filter";
  tooltipSms: string ="Filtrar";


  cambiarEstado() {
    this.tabsState.cambiarEstado(!this.tabsState.esFiltrar());
    if (this.tabsState.esFiltrar()) {
      this.icons = "pi pi-filter-slash";
      this.tooltipSms = "Ocultar filtro"
    } else {
      this.icons = "pi pi-filter";
      this.tooltipSms = "Filtrar"
    }
  }

}
