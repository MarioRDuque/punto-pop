import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { ProveedorListado } from './proveedor-listado/proveedor-listado';
import { ProveedorFormulario } from './proveedor-formulario/proveedor-formulario';
import { TabsStateService } from '../../../service/tabs.service';
import { CargandoService } from '../../../service/cargando.service';
import { TabsCard } from '../../../component/tabs-card/tabs-card';

@Component({
  selector: 'app-proveedor',
  standalone: true,
  imports: [TabsCard, ProveedorListado, ProveedorFormulario],
  templateUrl: './app.proveedor.html',
})
export class AppProveedor implements OnInit {
  tabsState = inject(TabsStateService);
  cargando = inject(CargandoService);

  @ViewChild(ProveedorFormulario) proveedorFormulario?: ProveedorFormulario;

  ngOnInit(): void {
    this.tabsState.onInit();
  }

  onTabChange(value: string | number | undefined): void {
    this.tabsState.onTabChange(value);
  }

  get showFormActions(): boolean {
    const active = this.tabsState.tabActivo();
    return active === 'crear' || active === 'editar';
  }

  onGuardar(): void {
    this.proveedorFormulario?.guardar();
  }

  onCancelar(): void {
    this.proveedorFormulario?.irAlListado();
  }
}
