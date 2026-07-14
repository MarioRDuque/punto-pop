import { Component, Input, Output, EventEmitter, ContentChild, TemplateRef } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TabsModule } from 'primeng/tabs';
import { TabsEnum } from '../../enums/tabs-enum';

@Component({
  selector: 'app-tabs-card',
  standalone: true,
  imports: [NgTemplateOutlet, ButtonModule, TooltipModule, TabsModule],
  templateUrl: './tabs-card.html',
})
export class TabsCard {
  readonly Tabs = TabsEnum;

  @ContentChild('listado') listadoTemplate?: TemplateRef<unknown>;
  @ContentChild('crear') crearTemplate?: TemplateRef<unknown>;
  @ContentChild('editar') editarTemplate?: TemplateRef<unknown>;

  @Input({ required: true }) tabActivo!: string;
  @Input({ required: true }) tabDeshabilitado!: boolean;
  @Input() loading = false;
  @Input() showActions = false;

  @Input() labelListado = 'Listado';
  @Input() labelCrear = 'Nuevo';
  @Input() labelEditar = 'Editar';
  @Input() iconListado = 'pi pi-list';
  @Input() iconCrear = 'pi pi-plus';
  @Input() iconEditar = 'pi pi-pencil';
  @Input() esVisualizacion = false;
  @Input() showBorrador = true;

  @Output() tabChange = new EventEmitter<string | number | undefined>();
  @Output() guardar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();
  @Output() borrador = new EventEmitter<void>();

  get submitLabel(): string {
    if (this.esVisualizacion) return 'Guardar';
    return this.tabActivo === TabsEnum.EDITAR ? 'Actualizar' : 'Guardar';
  }

  get submitIcon(): string {
    if (this.esVisualizacion) return 'pi pi-save';
    return this.tabActivo === TabsEnum.EDITAR ? 'pi pi-check' : 'pi pi-save';
  }
}
