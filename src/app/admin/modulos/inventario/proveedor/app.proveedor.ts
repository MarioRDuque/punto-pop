import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { ProveedorListado } from './proveedor-listado/proveedor-listado';
import { ProveedorFormulario } from './proveedor-formulario/proveedor-formulario';
import { ProveedorImportar } from './proveedor-importar/proveedor-importar';
import { TabsStateService } from '../../../service/tabs.service';
import { CargandoService } from '../../../service/cargando.service';
import { TabsCard } from '../../../component/tabs-card/tabs-card';
import { ExportarImprimir } from '../../../component/exportar-imprimir/exportar-imprimir';

@Component({
  selector: 'app-proveedor',
  standalone: true,
  imports: [ButtonModule, TooltipModule, DynamicDialogModule, TabsCard, ProveedorListado, ProveedorFormulario, ExportarImprimir],
  providers: [DialogService],
  templateUrl: './app.proveedor.html',
})
export class AppProveedor implements OnInit {
  tabsState = inject(TabsStateService);
  cargando = inject(CargandoService);
  private dialogService = inject(DialogService);

  @ViewChild(ProveedorFormulario) proveedorFormulario?: ProveedorFormulario;
  @ViewChild(ProveedorListado) proveedorListado?: ProveedorListado;

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

  exportar(): void { this.proveedorListado?.exportarSignal.set(true); }
  imprimir(): void { this.proveedorListado?.imprimirSignal.set(true); }

  importar(): void {
    this.dialogService.open(ProveedorImportar, {
      header: 'Importar proveedores',
      modal: true,
      width: '52rem',
      closable: true,
      contentStyle: { overflow: 'visible' },
    });
  }
}
