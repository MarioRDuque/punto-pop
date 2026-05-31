import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-accion-button',
  imports: [TooltipModule],
  templateUrl: './accion-button.html',
  styleUrl: './accion-button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class AccionButton implements ICellRendererAngularComp {

  private params!: ICellRendererParams;

  agInit(params: ICellRendererParams): void {
    this.params = params;
  }

  refresh(params: ICellRendererParams): boolean {
    this.params = params;
    return true;
  }

  ver() {
    this.params.context.parent.consultar(this.params.data);
  }

  editar() {
    this.params.context.parent.editar(this.params.data);
  }

  masOpciones() {
    this.params.context.parent.mostrarOpciones(this.params);
  }

}
