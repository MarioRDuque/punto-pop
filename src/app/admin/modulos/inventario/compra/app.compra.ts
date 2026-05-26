import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TabsModule } from 'primeng/tabs';
import { CompraListado } from './compra-listado/compra-listado';
import { CompraFormulario } from './compra-formulario/compra-formulario';
import { TabsEnum } from '../../../enums/tabs-enum';
import { TabsStateService } from '../../../service/tabs.service';
import { CargandoService } from '../../../service/cargando.service';
import { ICONSCONSTANT } from '../../../constantes/icons-constants';

@Component({
  selector: 'app-compra',
  standalone: true,
  imports: [ButtonModule, TooltipModule, TabsModule, CompraListado, CompraFormulario],
  templateUrl: './app.compra.html',
})
export class AppCompra implements OnInit {
  Tabs = TabsEnum;
  tabsState = inject(TabsStateService);
  cargando = inject(CargandoService);
  ICONSCONSTANT = ICONSCONSTANT;

  @ViewChild(CompraFormulario) compraFormulario?: CompraFormulario;

  ngOnInit(): void {
    this.tabsState.onInit();
  }

  onTabChange(value: string | number | undefined): void {
    this.tabsState.onTabChange(value);
  }

  get showFormActions(): boolean {
    const active = this.tabsState.tabActivo();
    return active === TabsEnum.CREAR;
  }

  onGuardar(): void {
    this.compraFormulario?.guardarCompra();
  }

  onCancelar(): void {
    this.compraFormulario?.irAlListado();
  }
}
