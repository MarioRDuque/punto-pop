import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TabsModule } from 'primeng/tabs';
import { ProductoFormulario } from './producto-formulario/producto-formulario';
import { ProductoListado } from './producto-listado/producto-listado';
import { TabsEnum } from '../../../enums/tabs-enum';
import { TabsStateService } from '../../../service/tabs.service';
import { CargandoService } from '../../../service/cargando.service';
import { ICONSCONSTANT } from '../../../constantes/icons-constants';

@Component({
  selector: 'app-producto',
  standalone: true,
  imports: [
    ButtonModule,
    TooltipModule,
    TabsModule,
    ProductoFormulario,
    ProductoListado
  ],
  templateUrl: './app.producto.html',
})
export class AppProducto implements OnInit {

  Tabs = TabsEnum;
  tabsState = inject(TabsStateService);
  cargando = inject(CargandoService);
  ICONSCONSTANT = ICONSCONSTANT;

  @ViewChild(ProductoFormulario) productoFormulario?: ProductoFormulario;

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
    this.productoFormulario?.guardar();
  }

  onCancelar(): void {
    this.productoFormulario?.irAlListado();
  }
}
