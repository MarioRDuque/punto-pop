import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { TabsStateService } from '../../service/tabs.service';
import { TabsEnum } from '../../enums/tabs-enum';
import { FormsService } from '../../service/forms-service';
import { AccionEnum } from '../../enums/accion-enum';
import { ICONSCONSTANT } from '../../constantes/icons-constants';

@Component({
  selector: 'app-header-crud',
  imports: [ButtonModule, CommonModule, PanelModule, TooltipModule],
  templateUrl: './header-crud.html',
  styleUrl: './header-crud.scss',
})
export class HeaderCrud {

  tabsState = inject(TabsStateService);
  formsService = inject(FormsService);

  @Input() subtitulo!: string;
  @Input() esFormulario = false;

  @Output() exportar = new EventEmitter<void>();
  @Output() imprimir = new EventEmitter<void>();

  public tabEnum = TabsEnum;
  public accionEnum = AccionEnum;
  ICONSCONSTANT = ICONSCONSTANT;

  onExportar() {
    this.exportar.emit();
  }

  onImprimir() {
    this.imprimir.emit();
  }

  regresar() {
    this.tabsState.irATab(this.tabEnum.LISTADO);
  }

}
