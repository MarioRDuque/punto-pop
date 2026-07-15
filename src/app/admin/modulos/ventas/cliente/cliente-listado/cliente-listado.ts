import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ColDef, GridApi } from 'ag-grid-community';
import { Grid } from '../../../../component/grid/grid';
import { ListadoToolbar, ToolbarTab } from '../../../../component/listado-toolbar/listado-toolbar';
import { ClienteService } from '../cliente.service';
import { ClienteFormulario } from '../cliente-formulario/cliente-formulario';
import { ToastService } from '../../../../service/toast.service';
import { CargandoService } from '../../../../service/cargando.service';
import { FormsService } from '../../../../service/forms-service';
import { TabsStateService } from '../../../../service/tabs.service';
import { VentaCliente } from '../../../../entities/VentaCliente';
import { AccionEnum } from '../../../../enums/accion-enum';
import { TabsEnum } from '../../../../enums/tabs-enum';
import { Observable } from 'rxjs';
import { PageResponse } from '../../../../entities/PageResponse';

type FilterTab = 'todos' | 'activos' | 'inactivos' | 'cedula' | 'ruc' | 'incompletos';

@Component({
  selector: 'app-cliente-listado',
  standalone: true,
  imports: [CommonModule, FormsModule, Grid, ListadoToolbar],
  templateUrl: './cliente-listado.html',
  providers: [DialogService],
})
export class ClienteListado implements OnInit {
  public clienteService = inject(ClienteService);
  private toast = inject(ToastService);
  private cargando = inject(CargandoService);
  private formsService = inject(FormsService) as FormsService<VentaCliente>;
  private tabsState = inject(TabsStateService);
  private destroyRef = inject(DestroyRef);
  public dialogService = inject(DialogService);

  public totalClientes = this.clienteService.totalClientes;
  public subtitulo = 'Listado de clientes';
  public colDefs: ColDef[] = [];
  public ref: DynamicDialogRef<ClienteFormulario> | null = null;

  public exportarSignal = signal(false);
  public imprimirSignal = signal(false);

  readonly activeFilter = signal<FilterTab>('todos');

  readonly tabs = computed<ToolbarTab[]>(() => [
    { key: 'todos',       label: 'Todos'            },
    { key: 'activos',     label: 'Activos'           },
    { key: 'inactivos',   label: 'Inactivos'         },
    { key: 'cedula',      label: 'Cédula'            },
    { key: 'ruc',         label: 'RUC'               },
    { key: 'incompletos', label: 'Datos incompletos' },
  ]);

  readonly searchQuery = signal<string>('');

  private gridApi: GridApi | null = null;

  readonly loadClientes = (startRow: number, endRow: number): Observable<PageResponse<VentaCliente>> => {
    const pageSize = endRow - startRow;
    const page = startRow / pageSize;
    return this.clienteService.cargar(
      this.activeFilter() === 'todos' ? undefined : this.activeFilter(),
      page, pageSize, this.searchQuery()
    );
  };

  ngOnInit(): void {
    this.colDefs = this.clienteService.generarColumnasListado();
  }

  setFilter(tab: FilterTab) {
    this.activeFilter.set(tab);
    this.gridApi?.refreshServerSide({ route: [], purge: true });
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
    this.gridApi?.setGridOption('quickFilterText', value);
  }

  onSearchSubmit(texto: string): void {
    const value = texto?.trim() ?? '';
    if (!value) {
      this.searchQuery.set('');
      this.gridApi?.setGridOption('quickFilterText', '');
      this.gridApi?.refreshServerSide({ route: [], purge: true });
      return;
    }
    if ((this.gridApi?.getDisplayedRowCount() ?? 0) === 0) {
      this.gridApi?.refreshServerSide({ route: [], purge: true });
    }
  }

  onGridReady(api: GridApi): void {
    this.gridApi = api;
  }

  exportarDesdeHeader() { this.exportarSignal.set(true); }
  imprimirDesdeHeader() { this.imprimirSignal.set(true); }

  editarObj(data: VentaCliente) {
    this.formsService.seleccionarObjeto(data);
    this.formsService.accion.set(AccionEnum.EDITAR);
    this.tabsState.cambiarEstadoTab(false);
    this.tabsState.irATab(TabsEnum.EDITAR);
  }

  consultarObj(data: VentaCliente) {
    this.formsService.seleccionarObjeto(data);
    this.formsService.accion.set(AccionEnum.CONSULTAR);
    this.ref = this.dialogService.open(ClienteFormulario, {
      header: 'Detalle de cliente',
      modal: true,
      width: '55vw',
      closable: true,
      maximizable: true,
      contentStyle: { overflow: 'auto' },
    });
  }

  cambiarEstados(event: { data: VentaCliente; estado: boolean }) {
    this.cargando.activar();
    if (event.data) {
      event.data.estado = event.estado;
      this.clienteService
        .actualizar(event.data)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (resultado) => {
            this.toast.success(
              'Cliente ' + resultado.nombre + (resultado.estado ? ' activado' : ' inactivado')
            );
            this.gridApi?.refreshServerSide({ route: [], purge: true });
            this.cargando.inactivar();
          },
        });
    }
  }

  eliminarObj(data: VentaCliente) {
    this.cargando.activar();
    if (data) {
      this.clienteService
        .eliminar(data)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.toast.success('El cliente ha sido eliminado.');
            this.gridApi?.refreshServerSide({ route: [], purge: true });
            this.cargando.inactivar();
          },
        });
    }
  }
}
