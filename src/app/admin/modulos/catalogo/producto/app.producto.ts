import { Component, inject, OnInit } from '@angular/core';
import { FluidModule } from 'primeng/fluid';
import { PanelModule } from 'primeng/panel';
import { TabsModule } from 'primeng/tabs';
import { ProductoFormulario } from './producto-formulario/producto-formulario';
import { ProductoListado } from './producto-listado/producto-listado';
import { TabsEnum } from '../../../enums/tabs-enum';
import { TabsStateService } from '../../../service/tabs.service';
import { ICONSCONSTANT } from '../../../constantes/icons-constants';

@Component({
  selector: 'app-producto',
  standalone: true,
  imports: [
    FluidModule,
    PanelModule,
    TabsModule,
    ProductoFormulario,
    ProductoListado
  ],
  templateUrl: './app.producto.html',
})
export class AppProducto implements OnInit {

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
