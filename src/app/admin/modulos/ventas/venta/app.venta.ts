import { Component, inject, OnInit } from '@angular/core';
import { FluidModule } from 'primeng/fluid';
import { PanelModule } from 'primeng/panel';
import { TabsModule } from 'primeng/tabs';
import { VentaFormulario } from './venta-formulario/venta-formulario';
import { VentaListado } from './venta-listado/venta-listado';
import { TabsEnum } from '../../../enums/tabs-enum';
import { TabsStateService } from '../../../service/tabs.service';
import { ICONSCONSTANT } from '../../../constantes/icons-constants';

@Component({
  selector: 'app-venta',
  standalone: true,
  imports: [
    FluidModule,
    PanelModule,
    TabsModule,
    VentaFormulario,
    VentaListado,
  ],
  templateUrl: './app.venta.html',
})
export class AppVenta implements OnInit {

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
