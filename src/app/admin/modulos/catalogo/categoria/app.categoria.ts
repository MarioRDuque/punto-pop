import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CategoriaFormulario } from './categoria-formulario/categoria-formulario';
import { CategoriaListado } from './categoria-listado/categoria-listado';
import { TabsStateService } from '../../../service/tabs.service';
import { CargandoService } from '../../../service/cargando.service';
import { TabsCard } from '../../../component/tabs-card/tabs-card';
import { ExportarImprimir } from '../../../component/exportar-imprimir/exportar-imprimir';

@Component({
  selector: 'app-categoria',
  standalone: true,
  imports: [
    TabsCard,
    CategoriaFormulario,
    CategoriaListado,
    ExportarImprimir,
  ],
  templateUrl: './app.categoria.html',
})
export class AppCategoria implements OnInit {

  tabsState = inject(TabsStateService);
  cargando = inject(CargandoService);

  @ViewChild(CategoriaFormulario) categoriaFormulario?: CategoriaFormulario;
  @ViewChild(CategoriaListado) categoriaListado?: CategoriaListado;

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
    this.categoriaFormulario?.guardar();
  }

  onCancelar(): void {
    this.categoriaFormulario?.irAlListado();
  }

  exportar(): void { this.categoriaListado?.exportarSignal.set(true); }
  imprimir(): void { this.categoriaListado?.imprimirSignal.set(true); }
}
