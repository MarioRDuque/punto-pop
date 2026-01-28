import { Component, inject, Input } from '@angular/core';
import { ColDef, DefaultMenuItem, GetContextMenuItemsParams, GridApi, GridReadyEvent, GridSizeChangedEvent, MenuItemDef, SizeColumnsToFitGridStrategy, Theme } from 'ag-grid-community';
import { FloatLabel } from "primeng/floatlabel";
import { IconField } from "primeng/iconfield";
import { InputIcon } from "primeng/inputicon";
import { AgGridAngular } from "ag-grid-angular";
import { myTheme } from '../../constantes/ag-grid-theme-builder';
import { AG_GRID_LOCALE_ES } from '@ag-grid-community/locale';
import { InputTextModule } from 'primeng/inputtext';
import { TabsStateService } from '../../service/tabs.service';
import { Tabs } from '../../enums/Tabs';
import { FormsData } from '../../service/forms-data';

@Component({
  selector: 'app-grid',
  imports: [FloatLabel, IconField, InputIcon, AgGridAngular, InputTextModule],
  templateUrl: './grid.html',
  styleUrl: './grid.scss',
})
export class Grid<T> {

  tabsState = inject(TabsStateService);
  formsData = inject(FormsData);
  puedeEditar = false;
  @Input() rowData: T[] = [];
  @Input() colDefs: ColDef[] = [];
  private gridApi!: GridApi;
  public theme: Theme = myTheme;
  public localeText = AG_GRID_LOCALE_ES;
  public autoSizeStrategy: SizeColumnsToFitGridStrategy = {
    type: 'fitGridWidth',
    defaultMinWidth: 100
  };
  public objetoSeleccionado: T | null = null;

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
    this.gridApi.setGridOption('quickFilterText', value);
  }

  onGridSizeChanged(params: GridSizeChangedEvent) {
    params.api.sizeColumnsToFit();
  }

  getContextMenuItems = (
    params: GetContextMenuItemsParams,
  ):
    | (DefaultMenuItem | MenuItemDef)[]
    | Promise<(DefaultMenuItem | MenuItemDef)[]> => {
    const result: (DefaultMenuItem | MenuItemDef)[] = [
      {
        name: "Editar",
        icon: '<span class="ag-icon ag-icon-edit"></span>',
        action: (event) => {
          this.editarUsuario(event?.node?.data);
        },
      },
      {
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
        name: "Eliminar",
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

  editarUsuario(data: T) {
    this.tabsState.cambiarEstado(true);
    this.tabsState.irATab(Tabs.EDITAR);
    this.formsData.seleccionarObjeto(data);
  }

}
