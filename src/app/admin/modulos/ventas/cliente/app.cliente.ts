import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { ClienteFormulario } from './cliente-formulario/cliente-formulario';
import { ClienteListado } from './cliente-listado/cliente-listado';
import { ClienteImportar } from './cliente-importar/cliente-importar';
import { TabsStateService } from '../../../service/tabs.service';
import { CargandoService } from '../../../service/cargando.service';
import { TabsCard } from '../../../component/tabs-card/tabs-card';
import { ExportarImprimir } from '../../../component/exportar-imprimir/exportar-imprimir';

@Component({
  selector: 'app-cliente',
  standalone: true,
  imports: [
    ButtonModule,
    TooltipModule,
    TabsCard,
    DynamicDialogModule,
    ClienteFormulario,
    ClienteListado,
    ExportarImprimir,
  ],
  providers: [DialogService],
  templateUrl: './app.cliente.html',
})
export class AppCliente implements OnInit {

  tabsState = inject(TabsStateService);
  cargando = inject(CargandoService);
  private dialogService = inject(DialogService);

  @ViewChild(ClienteFormulario) clienteFormulario?: ClienteFormulario;
  @ViewChild(ClienteListado) clienteListado?: ClienteListado;

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

  get showListActions(): boolean {
    return this.tabsState.tabActivo() === 'listado';
  }

  onGuardar(): void {
    this.clienteFormulario?.guardar();
  }

  onCancelar(): void {
    this.clienteFormulario?.irAlListado();
  }

  exportar(): void { this.clienteListado?.exportarSignal.set(true); }
  imprimir(): void { this.clienteListado?.imprimirSignal.set(true); }

  importar(): void {
    this.dialogService.open(ClienteImportar, {
      header: 'Importar clientes',
      modal: true,
      width: '52rem',
      closable: true,
      contentStyle: { overflow: 'visible' },
    });
  }
}
