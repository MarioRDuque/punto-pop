import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { ButtonModule } from "primeng/button";
import { TooltipModule } from 'primeng/tooltip';
import { ICONSCONSTANT } from '../../constantes/icons-constants';

@Component({
  selector: 'app-accion-button',
  imports: [
    ButtonModule,
    TooltipModule
  ],
  templateUrl: './accion-button.html',
  styleUrl: './accion-button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class AccionButton implements ICellRendererAngularComp {

  private params!: ICellRendererParams;
  company = signal('');
  ICONSCONSTANT = ICONSCONSTANT;

  agInit(params: ICellRendererParams): void {
    this.params = params;
    this.refresh(params);
  }

  refresh(params: ICellRendererParams) {
    this.company.set(params.data?.company ?? '');
    return true;
  }

  mostrarOpciones() {
    this.params.context.parent.mostrarOpciones(this.params);
  }

}
