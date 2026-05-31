import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { ProductoFormulario } from './producto-formulario/producto-formulario';
import { ProductoListado } from './producto-listado/producto-listado';
import { ProductoImportar } from './producto-importar/producto-importar';
import { TabsStateService } from '../../../service/tabs.service';
import { CargandoService } from '../../../service/cargando.service';
import { TabsCard } from '../../../component/tabs-card/tabs-card';
import { ExportarImprimir } from '../../../component/exportar-imprimir/exportar-imprimir';

@Component({
  selector: 'app-producto',
  standalone: true,
  imports: [
    ButtonModule,
    TooltipModule,
    DynamicDialogModule,
    TabsCard,
    ProductoFormulario,
    ProductoListado,
    ExportarImprimir,
  ],
  providers: [DialogService],
  templateUrl: './app.producto.html',
})
export class AppProducto implements OnInit {

  tabsState = inject(TabsStateService);
  cargando = inject(CargandoService);
  private dialogService = inject(DialogService);

  @ViewChild(ProductoFormulario) productoFormulario?: ProductoFormulario;
  @ViewChild(ProductoListado) productoListado?: ProductoListado;

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

  exportar(): void { this.productoListado?.exportarSignal.set(true); }
  imprimir(): void { this.productoListado?.imprimirSignal.set(true); }

  importar(): void {
    this.dialogService.open(ProductoImportar, {
      header: 'Importar productos',
      modal: true,
      width: '52rem',
      closable: true,
      contentStyle: { overflow: 'visible' },
    });
  }
}
