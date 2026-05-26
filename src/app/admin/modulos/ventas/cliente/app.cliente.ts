import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TabsModule } from 'primeng/tabs';
import { ClienteFormulario } from './cliente-formulario/cliente-formulario';
import { ClienteListado } from './cliente-listado/cliente-listado';
import { TabsEnum } from '../../../enums/tabs-enum';
import { TabsStateService } from '../../../service/tabs.service';
import { CargandoService } from '../../../service/cargando.service';
import { ICONSCONSTANT } from '../../../constantes/icons-constants';

@Component({
  selector: 'app-cliente',
  standalone: true,
  imports: [
    ButtonModule,
    TooltipModule,
    TabsModule,
    ClienteFormulario,
    ClienteListado
  ],
  templateUrl: './app.cliente.html',
})
export class AppCliente implements OnInit {

  Tabs = TabsEnum;
  tabsState = inject(TabsStateService);
  cargando = inject(CargandoService);
  ICONSCONSTANT = ICONSCONSTANT;

  @ViewChild(ClienteFormulario) clienteFormulario?: ClienteFormulario;

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
    this.clienteFormulario?.guardar();
  }

  onCancelar(): void {
    this.clienteFormulario?.irAlListado();
  }
}
