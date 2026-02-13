import { Component, inject, OnInit } from '@angular/core';
import { FluidModule } from 'primeng/fluid';
import { PanelModule } from 'primeng/panel';
import { TabsModule } from 'primeng/tabs';
import { RolFormulario } from "./rol-formulario/rol-formulario";
import { RolListado } from "./rol-listado/rol-listado";
import { TabsEnum } from '../../../enums/tabs-enum';
import { TabsStateService } from '../../../service/tabs.service';
import { FormsService } from '../../../service/forms-service';
import { ICONSCONSTANT } from '../../../constantes/icons-constants';
import { AccionEnum } from '../../../enums/accion-enum';

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
  formsService = inject(FormsService);
  ICONSCONSTANT = ICONSCONSTANT;

  ngOnInit(): void {
    if (this.tabsState.tabActivo() === TabsEnum.EDITAR) {
      this.onTabChange(TabsEnum.LISTADO);
    }
  }

  onTabChange(value: string | number | undefined) {
    this.tabsState.irATab(value ?? TabsEnum.LISTADO);
    if (value == this.Tabs.CREAR) {
      this.formsService.accion.set(AccionEnum.CREAR);
    }
    this.tabsState.cambiarEstadoTab(true);
  }
}
