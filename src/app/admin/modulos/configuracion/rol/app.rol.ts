import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { RolFormulario } from './rol-formulario/rol-formulario';
import { RolListado } from './rol-listado/rol-listado';
import { TabsStateService } from '../../../service/tabs.service';
import { CargandoService } from '../../../service/cargando.service';
import { ICONSCONSTANT } from '../../../constantes/icons-constants';
import { TabsCard } from '../../../component/tabs-card/tabs-card';
import { ExportarImprimir } from '../../../component/exportar-imprimir/exportar-imprimir';

@Component({
  selector: 'app-rol',
  imports: [
    TabsCard,
    RolFormulario,
    RolListado,
    ExportarImprimir,
  ],
  templateUrl: './app.rol.html',
  styleUrl: './app.rol.scss',
})
export class AppRol implements OnInit {

  tabsState = inject(TabsStateService);
  cargando = inject(CargandoService);
  ICONSCONSTANT = ICONSCONSTANT;

  @ViewChild(RolFormulario) rolFormulario?: RolFormulario;
  @ViewChild(RolListado) rolListado?: RolListado;

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
    this.rolFormulario?.guardar();
  }

  onCancelar(): void {
    this.rolFormulario?.irAlListado();
  }

  exportar(): void { this.rolListado?.exportarSignal.set(true); }
  imprimir(): void { this.rolListado?.imprimirSignal.set(true); }
}
