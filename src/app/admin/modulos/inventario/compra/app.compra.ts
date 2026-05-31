import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CompraListado } from './compra-listado/compra-listado';
import { CompraFormulario } from './compra-formulario/compra-formulario';
import { TabsStateService } from '../../../service/tabs.service';
import { CargandoService } from '../../../service/cargando.service';
import { TabsCard } from '../../../component/tabs-card/tabs-card';

@Component({
  selector: 'app-compra',
  standalone: true,
  imports: [TabsCard, CompraListado, CompraFormulario],
  templateUrl: './app.compra.html',
})
export class AppCompra implements OnInit {
  tabsState = inject(TabsStateService);
  cargando = inject(CargandoService);

  @ViewChild(CompraFormulario) compraFormulario?: CompraFormulario;

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
}
