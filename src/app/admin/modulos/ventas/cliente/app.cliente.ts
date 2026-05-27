import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TabsModule } from 'primeng/tabs';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { ClienteFormulario } from './cliente-formulario/cliente-formulario';
import { ClienteListado } from './cliente-listado/cliente-listado';
import { ClienteImportar } from './cliente-importar/cliente-importar';
import { TabsEnum } from '../../../enums/tabs-enum';
import { TabsStateService } from '../../../service/tabs.service';
import { CargandoService } from '../../../service/cargando.service';
import { ICONSCONSTANT } from '../../../constantes/icons-constants';

@Component({
  selector: 'app-cliente',
  standalone: true,
  imports: [
    ButtonModule,
    TooltipModule,
    TabsModule,
    DynamicDialogModule,
    ClienteFormulario,
    ClienteListado,
  ],
  providers: [DialogService],
  templateUrl: './app.cliente.html',
})
export class AppCliente implements OnInit {

  Tabs = TabsEnum;
  tabsState = inject(TabsStateService);
  cargando = inject(CargandoService);
  ICONSCONSTANT = ICONSCONSTANT;
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
    return active === TabsEnum.CREAR || active === TabsEnum.EDITAR;
  }

  get showListActions(): boolean {
    return this.tabsState.tabActivo() === TabsEnum.LISTADO;
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
