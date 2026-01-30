import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IStatusPanelAngularComp } from 'ag-grid-angular';
import { IStatusPanelParams } from 'ag-grid-enterprise';
import { SelectModule } from "primeng/select";

interface Combo {
  name: string;
  code: string;
}

@Component({
  selector: 'app-status-bar-filtros',
  imports: [SelectModule, FormsModule],
  templateUrl: './status-bar-filtros.html',
  styleUrl: './status-bar-filtros.scss',
})
export class StatusBarFiltros implements IStatusPanelAngularComp {
  private params!: IStatusPanelParams;

  opciones: Combo[] = [];
  seleccionado: Combo | undefined;

  agInit(params: IStatusPanelParams): void {
    this.params = params;
    this.opciones = [
      { name: '50 Registros', code: '50' },
      { name: 'Todos', code: 'T' },
      { name: 'Incluir Inactivos', code: 'II' }
    ];
    this.seleccionado = this.opciones[0];
  }

  cambiarSeleccionado(): void {
    const valor = this.seleccionado?.code;
    this.params.context.parent.onFiltroStatusBarChange(valor);
  }
}
