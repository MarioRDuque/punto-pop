import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { TabsStateService } from '../../service/tabs.service';
import { TabsEnum } from '../../enums/tabs-enum';

@Component({
  selector: 'app-header-crud',
  imports: [ButtonModule, CommonModule, PanelModule, TooltipModule],
  templateUrl: './header-crud.html',
  styleUrl: './header-crud.scss',
})
export class HeaderCrud {
  
  tabsState = inject(TabsStateService);

  @Input() titulo!: string;
  @Input() subtitulo!: string;
  @Input() esFormulario = false;
  @Input() esCrear = false;

  @Output() exportarExcel = new EventEmitter<void>();
  
  public tabs = TabsEnum;
  
  onExportar() {
    this.exportarExcel.emit();
  }

}
