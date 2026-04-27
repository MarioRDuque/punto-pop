import { Component, inject, OnInit } from '@angular/core';
import { FluidModule } from 'primeng/fluid';
import { PanelModule } from 'primeng/panel';
import { TabsModule } from 'primeng/tabs';
import { CompraListado } from './compra-listado/compra-listado';
import { CompraFormulario } from './compra-formulario/compra-formulario';
import { TabsEnum } from '../../../enums/tabs-enum';
import { TabsStateService } from '../../../service/tabs.service';

@Component({
  selector: 'app-compra',
  standalone: true,
  imports: [FluidModule, PanelModule, TabsModule, CompraListado, CompraFormulario],
  templateUrl: './app.compra.html',
})
export class AppCompra implements OnInit {
  Tabs = TabsEnum;
  tabsState = inject(TabsStateService);

  ngOnInit(): void {
    this.tabsState.onInit();
  }

  onTabChange(value: string | number | undefined): void {
    this.tabsState.onTabChange(value);
  }
}
