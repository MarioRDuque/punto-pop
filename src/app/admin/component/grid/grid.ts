import { Component, effect, EventEmitter, inject, Input, Output, Signal } from '@angular/core';
import { ColDef, DefaultMenuItem, GridApi, GridReadyEvent, GridSizeChangedEvent, MenuItemDef, Theme } from 'ag-grid-community';
import { FloatLabel } from "primeng/floatlabel";
import { IconField } from "primeng/iconfield";
import { InputIcon } from "primeng/inputicon";
import { AgGridAngular } from "ag-grid-angular";
import { myTheme } from '../../constantes/ag-grid-theme-builder';
import { AG_GRID_LOCALE_ES } from '@ag-grid-community/locale';
import { InputTextModule } from 'primeng/inputtext';
import { TabsStateService } from '../../service/tabs.service';
import { TabsEnum } from '../../enums/tabs-enum';
import { FormsData } from '../../service/forms-data';
import { StatusBarFiltros } from '../status-bar-filtros/status-bar-filtros';
import { TooltipModule } from 'primeng/tooltip';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { UsuarioFormulario } from '../../modulos/configuracion/usuarios/usuario-formulario/usuario-formulario';

@Component({
  selector: 'app-grid',
  imports: [
    FloatLabel,
    IconField,
    InputIcon,
    AgGridAngular,
    InputTextModule,
    TooltipModule
  ],
  templateUrl: './grid.html',
  styleUrl: './grid.scss',
  providers: [DialogService]
})
export class Grid<T> {

  tabsState = inject(TabsStateService);
  formsData = inject(FormsData);
  public dialogService = inject(DialogService)

  @Input() rowData: T[] = [];
  @Input() colDefs: ColDef[] = [];
  @Input() exportarSignal!: Signal<number>;

  @Output() buscarEnBdd = new EventEmitter<string>();

  public objetoSeleccionado: T | null = null;

  //Grid
  private gridApi!: GridApi;
  public theme: Theme = myTheme;
  public localeText = AG_GRID_LOCALE_ES;
  gridContext = {
    parent: this
  };
  defaultColDef: ColDef = {
    filter: true,
    resizable: true,
    sortable: true
  };

  statusBar = {
    statusPanels: [
      { statusPanel: StatusBarFiltros }
    ]
  };

  public consulta: boolean = false;
  constructor() {
    effect(() => {
      this.exportarSignal();
      this.gridApi?.exportDataAsExcel();
    });
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridApi.setFocusedCell(0, this.gridApi.getAllDisplayedColumns()[0])
  }

  onFilterTextBoxChanged(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.gridApi.setGridOption('quickFilterText', value);
  }

  onFiltroStatusBarChange(value: string) {
    this.buscarEnBdd.emit(value);
  }

  buscar(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.buscarEnBdd.emit(value);
  }

  onGridSizeChanged(params: GridSizeChangedEvent) {
    params.api.sizeColumnsToFit();
  }

  getContextMenuItems = ():
    | (DefaultMenuItem | MenuItemDef)[]
    | Promise<(DefaultMenuItem | MenuItemDef)[]> => {
    const result: (DefaultMenuItem | MenuItemDef)[] = [
      {
        name: "Editar",
        icon: '<i class="pi pi-pen-to-square text-xs"></i>',
        action: (event) => {
          this.editar(event?.node?.data);
        },
      },
      {
        name: "Consultar",
        icon: '<i class="pi pi-search text-xs"></i>',
        action: (event) => {
          this.consultar(event?.node?.data);
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
    return result;
  };

  editar(data: T) {
    this.tabsState.cambiarEstadoTab(false);
    this.tabsState.irATab(TabsEnum.EDITAR);
    this.formsData.seleccionarObjeto(data);
  }

  ref: any;

  consultar(data: T) {
    this.formsData.seleccionarObjeto(data);
    this.ref = this.dialogService.open(UsuarioFormulario, {
      header: 'Consultar Usuario', 
      modal: true,
      width: '50vw',
      closable: true,
      maximizable:true,
      contentStyle: { overflow: 'auto' },
      inputValues: {
        esConsultar: true
      },
    });
  }

}
