import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TabsModule } from 'primeng/tabs';
import { CategoriaFormulario } from './categoria-formulario/categoria-formulario';
import { CategoriaListado } from './categoria-listado/categoria-listado';
import { TabsEnum } from '../../../enums/tabs-enum';
import { TabsStateService } from '../../../service/tabs.service';
import { CargandoService } from '../../../service/cargando.service';
import { ICONSCONSTANT } from '../../../constantes/icons-constants';

@Component({
  selector: 'app-categoria',
  standalone: true,
  imports: [
    ButtonModule,
    TooltipModule,
    TabsModule,
    CategoriaFormulario,
    CategoriaListado
  ],
  templateUrl: './app.categoria.html',
})
export class AppCategoria implements OnInit {

  Tabs = TabsEnum;
  tabsState = inject(TabsStateService);
  cargando = inject(CargandoService);
  ICONSCONSTANT = ICONSCONSTANT;

  @ViewChild(CategoriaFormulario) categoriaFormulario?: CategoriaFormulario;

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
    this.categoriaFormulario?.guardar();
  }

  onCancelar(): void {
    this.categoriaFormulario?.irAlListado();
  }
}
