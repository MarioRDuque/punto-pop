import { Component, effect, EventEmitter, inject, Input, Output, Signal } from '@angular/core';
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

  @Input() rowData: T[] = [];
  @Input() colDefs: ColDef[] = [];
  @Input() exportarSignal!: Signal<number>;
  @Input() campoEstado!: string;

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

  constructor(
    private confirmationService: ConfirmationService
  ) {
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
      message: '¿Esta seguro que desea eliminar?',
      header: 'Eliminar',
      closable: true,
      closeOnEscape: true,
      icon: 'pi pi-info-circle',
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
