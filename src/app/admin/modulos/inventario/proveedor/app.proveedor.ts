import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TabsModule } from 'primeng/tabs';
import { ProveedorListado } from './proveedor-listado/proveedor-listado';
import { ProveedorFormulario } from './proveedor-formulario/proveedor-formulario';
import { TabsEnum } from '../../../enums/tabs-enum';
import { TabsStateService } from '../../../service/tabs.service';
import { CargandoService } from '../../../service/cargando.service';
import { ICONSCONSTANT } from '../../../constantes/icons-constants';

@Component({
  selector: 'app-proveedor',
  standalone: true,
  imports: [ButtonModule, TooltipModule, TabsModule, ProveedorListado, ProveedorFormulario],
  templateUrl: './app.proveedor.html',
})
export class AppProveedor implements OnInit {
  Tabs = TabsEnum;
  tabsState = inject(TabsStateService);
  cargando = inject(CargandoService);
  ICONSCONSTANT = ICONSCONSTANT;

  @ViewChild(ProveedorFormulario) proveedorFormulario?: ProveedorFormulario;

  ngOnInit(): void {
    this.tabsState.onInit();
  }

  onTabChange(value: string | number | undefined): void {
    this.tabsState.onTabChange(value);
  }

  get showFormActions(): boolean {
    const active = this.tabsState.tabActivo();
    return active === TabsEnum.CREAR || active === TabsEnum.EDITAR;
  }

  onGuardar(): void {
    this.proveedorFormulario?.guardar();
  }

  onCancelar(): void {
    this.proveedorFormulario?.irAlListado();
  }
}
