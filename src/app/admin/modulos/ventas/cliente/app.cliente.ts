import { Component, inject, OnInit } from '@angular/core';
import { FluidModule } from 'primeng/fluid';
import { PanelModule } from 'primeng/panel';
import { TabsModule } from 'primeng/tabs';
import { ClienteFormulario } from './cliente-formulario/cliente-formulario';
import { ClienteListado } from './cliente-listado/cliente-listado';
import { TabsEnum } from '../../../enums/tabs-enum';
import { TabsStateService } from '../../../service/tabs.service';
import { ICONSCONSTANT } from '../../../constantes/icons-constants';

@Component({
  selector: 'app-cliente',
  standalone: true,
  imports: [
    FluidModule,
    PanelModule,
    TabsModule,
    ClienteFormulario,
    ClienteListado
  ],
  templateUrl: './app.cliente.html',
})
export class AppCliente implements OnInit {

  Tabs = TabsEnum;
  tabsState = inject(TabsStateService);
  ICONSCONSTANT = ICONSCONSTANT;

  ngOnInit(): void {
    this.tabsState.onInit();
  }

  onTabChange(value: string | number | undefined) {
    this.tabsState.onTabChange(value);
  }
}
