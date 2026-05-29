import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TabsModule } from 'primeng/tabs';
import { VentaFormulario } from './venta-formulario/venta-formulario';
import { VentaListado } from './venta-listado/venta-listado';
import { TabsEnum } from '../../../enums/tabs-enum';
import { TabsStateService } from '../../../service/tabs.service';
import { CargandoService } from '../../../service/cargando.service';
import { VentaService } from './venta.service';
import { ICONSCONSTANT } from '../../../constantes/icons-constants';

@Component({
  selector: 'app-venta',
  standalone: true,
  imports: [
    ButtonModule,
    TooltipModule,
    TabsModule,
    VentaFormulario,
    VentaListado,
  ],
  templateUrl: './app.venta.html',
})
export class AppVenta implements OnInit {

  @ViewChild(VentaFormulario) ventaFormulario?: VentaFormulario;

  Tabs = TabsEnum;
  tabsState = inject(TabsStateService);
  cargando = inject(CargandoService);
  ventaService = inject(VentaService);
  ICONSCONSTANT = ICONSCONSTANT;

  get totalVentas(): number { return this.ventaService.totalVentas(); }
  get cartItems(): number { return this.ventaFormulario?.itemCount() ?? 0; }

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
    this.ventaFormulario?.abrirConfirmacion();
  }

  onCancelar(): void {
    this.tabsState.irATab(TabsEnum.LISTADO);
  }
}
