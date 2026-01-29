import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
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

  @Input() titulo!: string;
  @Input() subtitulo!: string;
  @Input() esFormulario = false;

  tabsState = inject(TabsStateService);

  public tabs = TabsEnum;

}
