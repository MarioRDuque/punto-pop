import { Component, effect, EventEmitter, inject, Input, Output, WritableSignal } from '@angular/core';
import { ColDef, DefaultMenuItem, GetContextMenuItemsParams, GridApi, GridReadyEvent, GridSizeChangedEvent, ICellRendererParams, IContextMenuParams, MenuItemDef, Theme } from 'ag-grid-community';
import { FloatLabel } from "primeng/floatlabel";
import { IconField } from "primeng/iconfield";
import { InputIcon } from "primeng/inputicon";
import { AgGridAngular } from "ag-grid-angular";
import { myTheme } from '../../constantes/ag-grid-theme-builder';
import { AG_GRID_LOCALE_ES } from '@ag-grid-community/locale';
import { InputTextModule } from 'primeng/inputtext';
import { TabsStateService } from '../../service/tabs.service';
import { TabsEnum } from '../../enums/tabs-enum';
import { FormsService } from '../../service/forms-service';
import { StatusBarFiltros } from '../status-bar-filtros/status-bar-filtros';
import { TooltipModule } from 'primeng/tooltip';
import { TipoFiltro } from '../../enums/tipo-filtro';
import { EventCrudBusqueda } from '../../enums/event-crud-busqueda';
import { AccionEnum } from '../../enums/accion-enum';
import { ICONSCONSTANT } from '../../constantes/icons-constants';
import printJS from 'print-js';
import { UtilService } from '../../service/util.service';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';

@Component({
  selector: 'app-grid',
  imports: [
    FloatLabel,
    IconField,
    InputIcon,
    AgGridAngular,
    InputTextModule,
    TooltipModule,
    ConfirmDialog
  ],
  templateUrl: './grid.html',
  styleUrl: './grid.scss',
  providers: [ConfirmationService]
})
export class Grid<T> {

  public tabsState = inject(TabsStateService);
  public formsService = inject(FormsService);
  public utilService = inject(UtilService);
  private confirmationService = inject(ConfirmationService);

  @Input() rowData: T[] = [];
  @Input() colDefs: ColDef[] = [];
  @Input({ required: true }) exportarSignal!: WritableSignal<boolean>;
  @Input({ required: true }) imprimirSignal!: WritableSignal<boolean>;
  @Input() campoEstado!: string;
  @Input() subtitulo!: string;

  @Output() buscarEnBdd = new EventEmitter<EventCrudBusqueda>();
  @Output() cambiarEstados = new EventEmitter<{ data: T; estado: boolean }>();
  @Output() consultarObj = new EventEmitter<T>();
  @Output() eliminarObj = new EventEmitter<T>();

  public objetoSeleccionado: T | null = null;
  ICONSCONSTANT = ICONSCONSTANT;

  //Grid
  private gridApi!: GridApi;
  public theme: Theme = myTheme;
  public localeText = AG_GRID_LOCALE_ES;
  public gridContext = {
    parent: this
  };
  public defaultColDef: ColDef = {
    filter: true,
    resizable: true,
    sortable: true
  };
  public statusBar = {
    statusPanels: [
      { statusPanel: StatusBarFiltros }
    ]
  };

  constructor() {
    effect(() => {
      if (this.exportarSignal()) {
        this.exportar();
        this.exportarSignal.set(false);
      }
      if (this.imprimirSignal()) {
        this.imprimir();
        this.imprimirSignal.set(false);
      }
    });
  }

  imprimir() {
    if (this.gridApi) {
      printJS({
        printable: this.utilService.sanitizeForPrint(this.rowData),
        type: 'json',
        properties: this.getPrintProperties(),
        header: '<h3>' + this.subtitulo + '</h3>',
        style: this.utilService.getAgGridPrintStyle()
      });
    }
  }

  exportar() {
    this.gridApi?.exportDataAsExcel({
      fileName: this.subtitulo + '.xlsx',
      exportAsExcelTable: true
    });
  }

  getPrintProperties() {
    return this.colDefs
      .filter(col => col.field)
      .map(col => {
        const def = col;
        return {
          field: def.field as string,
          displayName: def.headerName || def.field
        };
      });
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
  }

  onFirstDataRendered() {
    const firstCol = this.gridApi
      .getDisplayedCenterColumns()
      .find(col => col.isVisible());
    if (firstCol) {
      this.gridApi.setFocusedCell(0, firstCol);
    }
  }

  onFilterTextBoxChanged(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.gridApi.setGridOption('quickFilterText', value);
  }

  onFiltroStatusBarChange(value: TipoFiltro) {
    this.buscarEnBdd.emit({
      filtro: value
    });
  }

  buscar(event: Event) {
    const value: string = (event.target as HTMLInputElement).value;
    this.buscarEnBdd.emit({
      texto: value
    });
  }

  onGridSizeChanged(params: GridSizeChangedEvent) {
    params.api.sizeColumnsToFit();
  }

  getContextMenuItems = (params: GetContextMenuItemsParams):
    | (DefaultMenuItem | MenuItemDef)[]
    | Promise<(DefaultMenuItem | MenuItemDef)[]> => {
    const estadoField = this.campoEstado; // Default 'estado'
    const data = params?.node?.data;
    const estadoActual = data?.[estadoField];
    const result: (DefaultMenuItem | MenuItemDef)[] = [
      {
        name: "Editar",
        icon: `<i class="${ICONSCONSTANT.EDITAR} text-xs"></i>`,
        action: () => {
          this.editar(params?.node?.data);
        },
      },
      {
        name: "Consultar",
        icon: `<i class="${ICONSCONSTANT.BUSCAR} text-xs"></i>`,
        action: () => {
          this.consultar(params?.node?.data);
        },
      },
      {
        name: "Estado",
        icon: `<i class="${ICONSCONSTANT.CHECK_CIRCULAR} text-xs"></i>`,
        subMenu: [
          {
            name: "Activar",
            icon: `<i class="${ICONSCONSTANT.CHECK} text-xs"></i>`,
            disabled: estadoActual,
            action: () => {
              this.cambiarEstado(params?.node?.data, true);
            },
          },
          {
            name: "Inactivar",
            icon: `<i class="${ICONSCONSTANT.CLOSE} text-xs"></i>`,
            disabled: !estadoActual,
            action: () => {
              this.cambiarEstado(params?.node?.data, false);
            },
          },
        ],
      },
      {
        name: "Eliminar",
        icon: `<i class="${ICONSCONSTANT.ELIMINAR} text-xs"></i>`,
        action: () => {
          this.confirmarEliminacion(params?.node?.data);
        },
      },
      "separator",
      "export",
    ];
    return result;
  };

  mostrarOpciones(params: ICellRendererParams) {
    const contextParams: IContextMenuParams = {
      rowNode: params.node!,
      column: params.column!,
      value: params.value,
      source: 'api'
    };
    this.gridApi.showContextMenu(contextParams);
  }

  editar(data: T) {
    this.tabsState.cambiarEstadoTab(false);
    this.tabsState.irATab(TabsEnum.EDITAR);
    this.formsService.accion.set(AccionEnum.EDITAR);
    this.formsService.seleccionarObjeto(data);
  }

  cambiarEstado(data: T, estado: boolean) {
    this.cambiarEstados.emit({
      data: data,
      estado: estado
    });
  }

  consultar(data: T) {
    this.consultarObj.emit(data);
  }

  confirmarEliminacion(data: T) {
    this.confirmationService.confirm({
      message: '¿Está seguro que desea eliminar?',
      header: 'Eliminar',
      closable: true,
      closeOnEscape: true,
      icon: ICONSCONSTANT.INFO_CIRCULAR,
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Eliminar',
        severity: 'danger'
      },
      accept: () => {
        this.eliminarObj.emit(data);
      }
    });
  }

}
