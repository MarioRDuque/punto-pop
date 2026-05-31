import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CategoriaFormulario } from './categoria-formulario/categoria-formulario';
import { CategoriaListado } from './categoria-listado/categoria-listado';
import { TabsStateService } from '../../../service/tabs.service';
import { CargandoService } from '../../../service/cargando.service';
import { TabsCard } from '../../../component/tabs-card/tabs-card';

@Component({
  selector: 'app-categoria',
  standalone: true,
  imports: [
    TabsCard,
    CategoriaFormulario,
    CategoriaListado
  ],
  templateUrl: './app.categoria.html',
})
export class AppCategoria implements OnInit {

  tabsState = inject(TabsStateService);
  cargando = inject(CargandoService);

  @ViewChild(CategoriaFormulario) categoriaFormulario?: CategoriaFormulario;

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
}
