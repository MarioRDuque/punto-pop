import { Component } from '@angular/core';
import { AgGridAngular } from "ag-grid-angular";
import type { ColDef, DefaultMenuItem, GetContextMenuItemsParams, GridApi, GridReadyEvent, MenuItemDef, SizeColumnsToFitGridStrategy } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry, themeQuartz } from "ag-grid-community";
import { HeaderCrud } from "../../../../component/header-crud/header-crud";
import { myTheme } from '../../../../constantes/ag-grid-theme-builder';
import { AG_GRID_LOCALE_ES } from '@ag-grid-community/locale';
import { IconField } from "primeng/iconfield";
import { InputIcon } from "primeng/inputicon";
import { FloatLabel } from "primeng/floatlabel";
import { InputTextModule } from 'primeng/inputtext';

ModuleRegistry.registerModules([AllCommunityModule]);
// Row Data Interface
interface IRow {
  make: string;
  model: string;
  price: number;
  electric: boolean;
}

@Component({
  selector: 'app-usuario-listado',
  imports: [AgGridAngular, HeaderCrud, InputTextModule, IconField, InputIcon, FloatLabel],
  templateUrl: './usuario-listado.html',
  styleUrl: './usuario-listado.scss',
})
export class UsuarioListado {

  public theme: any = myTheme;
  public localeText: any = AG_GRID_LOCALE_ES;
  private gridApi!: GridApi;
  subtitulo = 'Listado usuarios';

  // Row Data: The data to be displayed.
  rowData = [
    { make: "Tesla", model: "Model Y", price: 64950, electric: true },
    { make: "Ford", model: "F-Series", price: 33850, electric: false },
    { make: "Toyota", model: "Corolla", price: 29600, electric: false },
  ];

  // Column Definitions: Defines the columns to be displayed.
  colDefs: ColDef[] = [
    { field: "make" },
    { field: "model" },
    { field: "price" },
    { field: "electric" }
  ];

  defaultColDef: ColDef = {
    filter: true,
    cellDataType: false,
    resizable: true,
    sortable: true,
    flex: 1,
    suppressMovable: true
  };

  public autoSizeStrategy: SizeColumnsToFitGridStrategy = {
    type: 'fitGridWidth',
    defaultMinWidth: 100
  };

  onFilterTextBoxChanged() {
    this.gridApi.setGridOption(
      "quickFilterText",
      (document.getElementById("filter-text-box") as HTMLInputElement).value,
    );
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
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
