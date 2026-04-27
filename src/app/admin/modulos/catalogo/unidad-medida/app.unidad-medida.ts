import { Component, inject, OnInit } from '@angular/core';
import { FluidModule } from 'primeng/fluid';
import { PanelModule } from 'primeng/panel';
import { TabsModule } from 'primeng/tabs';
import { UnidadMedidaFormulario } from './unidad-medida-formulario/unidad-medida-formulario';
import { UnidadMedidaListado } from './unidad-medida-listado/unidad-medida-listado';
import { TabsEnum } from '../../../enums/tabs-enum';
import { TabsStateService } from '../../../service/tabs.service';
import { ICONSCONSTANT } from '../../../constantes/icons-constants';

@Component({
  selector: 'app-unidad-medida',
  standalone: true,
  imports: [
    FluidModule,
    PanelModule,
    TabsModule,
    UnidadMedidaFormulario,
    UnidadMedidaListado
  ],
  templateUrl: './app.unidad-medida.html',
})
export class AppUnidadMedida implements OnInit {

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
