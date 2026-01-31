import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { MenuItem, MessageService } from 'primeng/api';
import { ButtonModule } from "primeng/button";
import { TooltipModule } from 'primeng/tooltip';

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

  data: any;
  company = signal('');

  agInit(params: ICellRendererParams): void {
    this.data = params.data;
    this.refresh(params);
  }

  refresh(params: ICellRendererParams) {
    this.company.set(params.data?.company ?? '');
    return true;
  }

  buttonClicked() {
    console.log('Software Launched');
  }

  private messageService = inject(MessageService);

  items: MenuItem[];

    constructor() {
        this.items = [
                    {
                        label: 'Update',
                        icon: 'pi pi-refresh',
                        command: () => {
                            this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Data Updated', life: 3000 });
                        }
                    },
                    {
                        label: 'Delete',
                        icon: 'pi pi-times',
                        command: () => {
                            this.messageService.add({ severity: 'warn', summary: 'Delete', detail: 'Data Deleted', life: 3000 });
                        }
                    },
                    {
                        separator: true
                    },
                    {
                        label: 'Quit',
                        icon: 'pi pi-power-off',
                        command: () => {
                            window.open('https://angular.io/', '_blank');
                        }
                    }
                ];
    }

}
