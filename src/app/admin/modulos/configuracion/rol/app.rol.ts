import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TabsModule } from 'primeng/tabs';
import { RolFormulario } from './rol-formulario/rol-formulario';
import { RolListado } from './rol-listado/rol-listado';
import { TabsEnum } from '../../../enums/tabs-enum';
import { TabsStateService } from '../../../service/tabs.service';
import { CargandoService } from '../../../service/cargando.service';
import { ICONSCONSTANT } from '../../../constantes/icons-constants';

@Component({
  selector: 'app-rol',
  imports: [
    ButtonModule,
    TooltipModule,
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
  cargando = inject(CargandoService);
  ICONSCONSTANT = ICONSCONSTANT;

  @ViewChild(RolFormulario) rolFormulario?: RolFormulario;

  ngOnInit(): void {
    this.tabsState.onInit();
  }

  onTabChange(value: string | number | undefined) {
    this.tabsState.onTabChange(value);
  }

  get showFormActions(): boolean {
    const active = this.tabsState.tabActivo();
    return active === TabsEnum.CREAR || active === TabsEnum.EDITAR;
  }

  onGuardar(): void {
    this.rolFormulario?.guardar();
  }

  onCancelar(): void {
    this.rolFormulario?.irAlListado();
  }
}
