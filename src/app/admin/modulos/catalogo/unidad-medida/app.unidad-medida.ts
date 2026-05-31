import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { UnidadMedidaFormulario } from './unidad-medida-formulario/unidad-medida-formulario';
import { UnidadMedidaListado } from './unidad-medida-listado/unidad-medida-listado';
import { TabsStateService } from '../../../service/tabs.service';
import { CargandoService } from '../../../service/cargando.service';
import { TabsCard } from '../../../component/tabs-card/tabs-card';
import { ExportarImprimir } from '../../../component/exportar-imprimir/exportar-imprimir';

@Component({
  selector: 'app-unidad-medida',
  standalone: true,
  imports: [
    TabsCard,
    UnidadMedidaFormulario,
    UnidadMedidaListado,
    ExportarImprimir,
  ],
  templateUrl: './app.unidad-medida.html',
})
export class AppUnidadMedida implements OnInit {

  tabsState = inject(TabsStateService);
  cargando = inject(CargandoService);

  @ViewChild(UnidadMedidaFormulario) unidadMedidaFormulario?: UnidadMedidaFormulario;
  @ViewChild(UnidadMedidaListado) unidadMedidaListado?: UnidadMedidaListado;

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
    this.unidadMedidaFormulario?.guardar();
  }

  onCancelar(): void {
    this.unidadMedidaFormulario?.irAlListado();
  }

  exportar(): void { this.unidadMedidaListado?.exportarSignal.set(true); }
  imprimir(): void { this.unidadMedidaListado?.imprimirSignal.set(true); }
}
