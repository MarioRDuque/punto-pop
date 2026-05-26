import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ColDef } from 'ag-grid-community';
import { Grid } from '../../../../component/grid/grid';
import { ClienteService } from '../cliente.service';
import { ClienteFormulario } from '../cliente-formulario/cliente-formulario';
import { ToastService } from '../../../../service/toast.service';
import { CargandoService } from '../../../../service/cargando.service';
import { FormsService } from '../../../../service/forms-service';
import { TabsStateService } from '../../../../service/tabs.service';
import { VentaCliente } from '../../../../entities/VentaCliente';
import { AccionEnum } from '../../../../enums/accion-enum';
import { TabsEnum } from '../../../../enums/tabs-enum';
import { EventCrudBusqueda } from '../../../../enums/event-crud-busqueda';

type FilterTab = 'todos' | 'activos' | 'inactivos' | 'cedula' | 'ruc' | 'incompletos';

@Component({
  selector: 'app-cliente-listado',
  standalone: true,
  imports: [CommonModule, FormsModule, Grid],
  templateUrl: './cliente-listado.html',
  styleUrls: ['./cliente-listado.scss'],
  providers: [DialogService],
})
export class ClienteListado implements OnInit {
  private clienteService = inject(ClienteService);
  private toast = inject(ToastService);
  private cargando = inject(CargandoService);
  private formsService = inject(FormsService) as FormsService<VentaCliente>;
  private tabsState = inject(TabsStateService);
  private destroyRef = inject(DestroyRef);
  public dialogService = inject(DialogService);

  private listaClientes = this.clienteService.listaClientes;
  public subtitulo = 'Listado de clientes';
  public colDefs: ColDef[] = [];
  public ref: DynamicDialogRef<ClienteFormulario> | null = null;

  public exportarSignal = signal(false);
  public imprimirSignal = signal(false);

  readonly searchQuery = signal('');
  readonly activeFilter = signal<FilterTab>('todos');

  readonly counts = computed(() => {
    const list = this.listaClientes();
    return {
      todos: list.length,
      activos: list.filter((c) => c.estado).length,
      inactivos: list.filter((c) => !c.estado).length,
      cedula: list.filter((c) => c.tipoIdentificacion === 'CEDULA').length,
      ruc: list.filter((c) => c.tipoIdentificacion === 'RUC').length,
      incompletos: list.filter((c) => !c.email || !c.telefono).length,
    };
  });

  readonly filteredClientes = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const tab = this.activeFilter();
    return this.listaClientes().filter((c) => {
      const matchTab =
        tab === 'todos'       ? true
        : tab === 'activos'    ? c.estado
        : tab === 'inactivos'  ? !c.estado
        : tab === 'cedula'     ? c.tipoIdentificacion === 'CEDULA'
        : tab === 'ruc'        ? c.tipoIdentificacion === 'RUC'
        : !c.email || !c.telefono;
      if (!matchTab) return false;
      if (!q) return true;
      return (
        c.nombre?.toLowerCase().includes(q) ||
        c.identificacion?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.telefono?.toLowerCase().includes(q)
      );
    });
  });

  ngOnInit(): void {
    this.clienteService.cargar().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    this.colDefs = this.clienteService.generarColumnasListado();
  }

  setFilter(tab: FilterTab) { this.activeFilter.set(tab); }
  onSearch(q: string)       { this.searchQuery.set(q); }

  buscar(_event: EventCrudBusqueda) {
    this.clienteService.cargar().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
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
            this.clienteService.actualizarElGrid(resultado);
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
            this.clienteService.eliminarDelGrid(data);
            this.cargando.inactivar();
          },
        });
    }
  }
}
