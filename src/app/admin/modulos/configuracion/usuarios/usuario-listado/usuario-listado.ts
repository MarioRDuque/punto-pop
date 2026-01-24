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
import { Grid } from "../../../../component/grid/grid";

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
  imports: [HeaderCrud, Grid],
  templateUrl: './usuario-listado.html',
  styleUrl: './usuario-listado.scss',
})
export class UsuarioListado {

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

}
