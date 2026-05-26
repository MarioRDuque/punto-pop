import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TabsModule } from 'primeng/tabs';
import { UnidadMedidaFormulario } from './unidad-medida-formulario/unidad-medida-formulario';
import { UnidadMedidaListado } from './unidad-medida-listado/unidad-medida-listado';
import { TabsEnum } from '../../../enums/tabs-enum';
import { TabsStateService } from '../../../service/tabs.service';
import { CargandoService } from '../../../service/cargando.service';
import { ICONSCONSTANT } from '../../../constantes/icons-constants';

@Component({
  selector: 'app-unidad-medida',
  standalone: true,
  imports: [
    ButtonModule,
    TooltipModule,
    TabsModule,
    UnidadMedidaFormulario,
    UnidadMedidaListado
  ],
  templateUrl: './app.unidad-medida.html',
})
export class AppUnidadMedida implements OnInit {

  Tabs = TabsEnum;
  tabsState = inject(TabsStateService);
  cargando = inject(CargandoService);
  ICONSCONSTANT = ICONSCONSTANT;

  @ViewChild(UnidadMedidaFormulario) unidadMedidaFormulario?: UnidadMedidaFormulario;

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
    this.unidadMedidaFormulario?.guardar();
  }

  onCancelar(): void {
    this.unidadMedidaFormulario?.irAlListado();
  }
}
