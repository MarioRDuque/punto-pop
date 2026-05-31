import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { ProductoFormulario } from './producto-formulario/producto-formulario';
import { ProductoListado } from './producto-listado/producto-listado';
import { TabsStateService } from '../../../service/tabs.service';
import { CargandoService } from '../../../service/cargando.service';
import { TabsCard } from '../../../component/tabs-card/tabs-card';

@Component({
  selector: 'app-producto',
  standalone: true,
  imports: [
    TabsCard,
    ProductoFormulario,
    ProductoListado
  ],
  templateUrl: './app.producto.html',
})
export class AppProducto implements OnInit {

  tabsState = inject(TabsStateService);
  cargando = inject(CargandoService);

  @ViewChild(ProductoFormulario) productoFormulario?: ProductoFormulario;

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
    this.productoFormulario?.guardar();
  }

  onCancelar(): void {
    this.productoFormulario?.irAlListado();
  }
}
