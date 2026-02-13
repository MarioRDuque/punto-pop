import { Component, inject, OnInit } from '@angular/core';
import { FluidModule } from 'primeng/fluid';
import { PanelModule } from 'primeng/panel';
import { TabsModule } from 'primeng/tabs';
import { RolFormulario } from "./rol-formulario/rol-formulario";
import { RolListado } from "./rol-listado/rol-listado";
import { TabsEnum } from '../../../enums/tabs-enum';
import { TabsStateService } from '../../../service/tabs.service';
import { ICONSCONSTANT } from '../../../constantes/icons-constants';

@Component({
  selector: 'app-rol',
  imports: [
    FluidModule,
    PanelModule,
    TabsModule,
    RolFormulario,
    RolListado
  ],
  templateUrl: './app.rol.html',
  styleUrl: './app.rol.scss',
})
export class AppRol implements OnInit {

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