import { Component, effect, EventEmitter, inject, Input, Output, Signal } from '@angular/core';
import { ColDef, DefaultMenuItem, GetContextMenuItemsParams, GridApi, GridReadyEvent, GridSizeChangedEvent, MenuItemDef, Theme } from 'ag-grid-community';
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
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { UsuarioFormulario } from '../../modulos/configuracion/usuarios/usuario-formulario/usuario-formulario';
import { TipoFiltro } from '../../enums/tipo-filtro';
import { EventCrudBusqueda } from '../../enums/event-crud-busqueda';
import { AccionEnum } from '../../enums/accion-enum';
import { UsuariosService } from '../../modulos/configuracion/usuarios/usuarios.service';
import { ToastService } from '../../service/toast.service';
import { ConfUsuario } from '../../entities/ConfUsuario';
import { CargandoService } from '../../service/cargando.service';

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

  public tabsState = inject(TabsStateService);
  public formsService = inject(FormsService);
  public dialogService = inject(DialogService);
  private usuariosService = inject(UsuariosService);
  private toast = inject(ToastService);
  private cargando = inject(CargandoService);


  @Input() rowData: T[] = [];
  @Input() colDefs: ColDef[] = [];
  @Input() exportarSignal!: Signal<number>;

  @Output() buscarEnBdd = new EventEmitter<EventCrudBusqueda>();

  public objetoSeleccionado: T | null = null;

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
    const result: (DefaultMenuItem | MenuItemDef)[] = [
      {
        name: "Editar",
        icon: '<i class="pi pi-pen-to-square text-xs"></i>',
        action: () => {
          this.editar(params?.node?.data);
        },
      },
      {
        name: "Consultar",
        icon: '<i class="pi pi-search text-xs"></i>',
        action: () => {
          this.consultar(params?.node?.data);
        },
      },
      {
        name: "Estado",
        icon: '<i class="pi pi-check-circle text-xs"></i>',
        subMenu: [
          {
            name: "Activar",
            icon: '<i class="pi pi-check text-xs"></i>',
            disabled: params?.node?.data?.usuEstado,
            action: () => {
              this.cambiarEstado(params?.node?.data, true);
            },
          },
          {
            name: "Inactivar",
            icon: '<i class="pi pi-times text-xs"></i>',
            disabled: !params?.node?.data?.usuEstado,
            action: () => {
              this.cambiarEstado(params?.node?.data, false);
            },
          },
        ],
      },
      {
        name: "Eliminar",
        icon: '<i class="pi pi-trash text-xs"></i>',
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
    this.formsService.accion.set(AccionEnum.EDITAR);
    this.formsService.seleccionarObjeto(data);
  }

  cambiarEstado(data: T, estadoUsu: boolean) {
    this.cargando.activar();
    this.formsService.seleccionarObjeto(data);
    const usuario = this.formsService.objetoSeleccionado();
    if (usuario) {
      usuario.usuEstado = estadoUsu;
      this.usuariosService.actualizar(usuario)
        .subscribe({
          next: (estado) => this.despuesDeCambiarEstado(estado),
        });
    }
  }

  despuesDeCambiarEstado(estado: ConfUsuario) {
    this.toast.success("El usuario "+ estado.usuUsername +" ha sido ➔ " + (estado.usuEstado ? "ACTIVADO" : "INACTIVADO"));
    this.usuariosService.actualizarElGrid(estado);
    this.cargando.inactivar();
  }

  ref: DynamicDialogRef<UsuarioFormulario> | null = null;

  consultar(data: T) {
    this.formsService.seleccionarObjeto(data);
    this.formsService.accion.set(AccionEnum.CONSULTAR);
    this.ref = this.dialogService.open(UsuarioFormulario, {
      header: 'Consultar Usuario',
      modal: true,
      width: '50vw',
      closable: true,
      maximizable: true,
      contentStyle: { overflow: 'auto' }
    });
  }

}
