import { Component, inject, OnInit } from '@angular/core';
import { FluidModule } from 'primeng/fluid';
import { PanelModule } from 'primeng/panel';
import { TabsModule } from 'primeng/tabs';
import { CategoriaFormulario } from './categoria-formulario/categoria-formulario';
import { CategoriaListado } from './categoria-listado/categoria-listado';
import { TabsEnum } from '../../../enums/tabs-enum';
import { TabsStateService } from '../../../service/tabs.service';
import { ICONSCONSTANT } from '../../../constantes/icons-constants';

@Component({
  selector: 'app-categoria',
  standalone: true,
  imports: [
    FluidModule,
    PanelModule,
    TabsModule,
    CategoriaFormulario,
    CategoriaListado
  ],
  templateUrl: './app.categoria.html',
})
export class AppCategoria implements OnInit {

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
