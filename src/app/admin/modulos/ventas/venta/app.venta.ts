import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { VentaFormulario } from './venta-formulario/venta-formulario';
import { VentaListado } from './venta-listado/venta-listado';
import { TabsStateService } from '../../../service/tabs.service';
import { CargandoService } from '../../../service/cargando.service';
import { VentaService } from './venta.service';
import { TabsCard } from '../../../component/tabs-card/tabs-card';
import { ExportarImprimir } from '../../../component/exportar-imprimir/exportar-imprimir';

@Component({
  selector: 'app-venta',
  standalone: true,
  imports: [
    TabsCard,
    VentaFormulario,
    VentaListado,
    ExportarImprimir,
  ],
  templateUrl: './app.venta.html',
})
export class AppVenta implements OnInit {

  @ViewChild(VentaFormulario) ventaFormulario?: VentaFormulario;
  @ViewChild(VentaListado) ventaListado?: VentaListado;

  tabsState = inject(TabsStateService);
  cargando = inject(CargandoService);
  ventaService = inject(VentaService);

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
    return active === 'crear' || active === 'editar';
  }

  onGuardar(): void {
    this.ventaFormulario?.abrirConfirmacion();
  }

  onCancelar(): void {
    this.tabsState.irATab('listado');
  }

  exportar(): void { this.ventaListado?.exportarSignal.set(true); }
  imprimir(): void { this.ventaListado?.imprimirSignal.set(true); }
}
