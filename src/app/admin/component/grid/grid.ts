import { Component, Input } from '@angular/core';
import { ColDef, DefaultMenuItem, GetContextMenuItemsParams, GridReadyEvent, MenuItemDef, SizeColumnsToFitGridStrategy } from 'ag-grid-community';
import { FloatLabel } from "primeng/floatlabel";
import { IconField } from "primeng/iconfield";
import { InputIcon } from "primeng/inputicon";
import { AgGridAngular } from "ag-grid-angular";
import { myTheme } from '../../constantes/ag-grid-theme-builder';
import { AG_GRID_LOCALE_ES } from '@ag-grid-community/locale';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-grid',
  imports: [FloatLabel, IconField, InputIcon, AgGridAngular, InputTextModule],
  templateUrl: './grid.html',
  styleUrl: './grid.scss',
})
export class Grid {
  
  @Input() rowData: any[] = [];
  @Input() colDefs: ColDef[] = [];
  private gridApi: any;
  public theme: any = myTheme;
  public localeText: any = AG_GRID_LOCALE_ES;
  public autoSizeStrategy: SizeColumnsToFitGridStrategy = {
    type: 'fitGridWidth',
    defaultMinWidth: 100
  };

  defaultColDef: ColDef = {
    filter: true,
    cellDataType: false,
    resizable: true,
    sortable: true,
    flex: 1,
    suppressMovable: true
  };

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
  }

  onFilterTextBoxChanged(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.gridApi.setQuickFilter(value);
  }

  getContextMenuItems = (
    params: GetContextMenuItemsParams,
  ):
    | (DefaultMenuItem | MenuItemDef)[]
    | Promise<(DefaultMenuItem | MenuItemDef)[]> => {
    const result: (DefaultMenuItem | MenuItemDef)[] = [
      {
        // custom item
        name: "Editar ",
        icon: '<span class="ag-icon ag-icon-edit"></span>',
        action: () => {
          console.log("Logging about ");
        },
      },
      {
        // custom item
        name: "Estado",
        subMenu: [
          {
            name: "Activar",
            action: () => {
              console.log("Niall was pressed");
            },
          },
          {
            name: "Inactivar",
            disabled: true,
            action: () => {
              console.log("Sean was pressed");
            },
          },
        ],
      },
      {
        // custom item
        name: "Eliminar ",
        action: () => {
          console.log("Logging about ");
        },
      },
      "separator",
      "export",
    ];
    if (params.column?.getColId() === "country") {
      return new Promise((res) => setTimeout(() => res(result), 150));
    }
    return result;
  };

}
