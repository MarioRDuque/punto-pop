import { Component, inject, OnInit } from '@angular/core';
import { FluidModule } from 'primeng/fluid';
import { PanelModule } from 'primeng/panel';
import { TabsModule } from 'primeng/tabs';
import { ProveedorListado } from './proveedor-listado/proveedor-listado';
import { ProveedorFormulario } from './proveedor-formulario/proveedor-formulario';
import { TabsEnum } from '../../../enums/tabs-enum';
import { TabsStateService } from '../../../service/tabs.service';

@Component({
  selector: 'app-proveedor',
  standalone: true,
  imports: [FluidModule, PanelModule, TabsModule, ProveedorListado, ProveedorFormulario],
  templateUrl: './app.proveedor.html',
})
export class AppProveedor implements OnInit {
  Tabs = TabsEnum;
  tabsState = inject(TabsStateService);

  ngOnInit(): void {
    this.tabsState.onInit();
  }

  onTabChange(value: string | number | undefined): void {
    this.tabsState.onTabChange(value);
  }
}
