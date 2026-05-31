import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CompraListado } from './compra-listado/compra-listado';
import { CompraFormulario } from './compra-formulario/compra-formulario';
import { TabsStateService } from '../../../service/tabs.service';
import { CargandoService } from '../../../service/cargando.service';
import { TabsCard } from '../../../component/tabs-card/tabs-card';
import { ExportarImprimir } from '../../../component/exportar-imprimir/exportar-imprimir';

@Component({
  selector: 'app-compra',
  standalone: true,
  imports: [TabsCard, CompraListado, CompraFormulario, ExportarImprimir],
  templateUrl: './app.compra.html',
})
export class AppCompra implements OnInit {
  tabsState = inject(TabsStateService);
  cargando = inject(CargandoService);

  @ViewChild(CompraFormulario) compraFormulario?: CompraFormulario;
  @ViewChild(CompraListado) compraListado?: CompraListado;

  ngOnInit(): void {
    this.tabsState.onInit();
  }

  onTabChange(value: string | number | undefined): void {
    this.tabsState.onTabChange(value);
  }

  get showFormActions(): boolean {
    const active = this.tabsState.tabActivo();
    return active === 'crear';
  }

  onGuardar(): void {
    this.compraFormulario?.guardarCompra();
  }

  onCancelar(): void {
    this.compraFormulario?.irAlListado();
  }

  exportar(): void { this.compraListado?.exportarSignal.set(true); }
  imprimir(): void { this.compraListado?.imprimirSignal.set(true); }
}
