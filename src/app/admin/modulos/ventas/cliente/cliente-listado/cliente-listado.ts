import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ColDef } from 'ag-grid-community';
import { HeaderCrud } from '../../../../component/header-crud/header-crud';
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

@Component({
  selector: 'app-cliente-listado',
  standalone: true,
  imports: [HeaderCrud, Grid],
  templateUrl: './cliente-listado.html',
  providers: [DialogService]
})
export class ClienteListado implements OnInit {

  private clienteService = inject(ClienteService);
  private toast = inject(ToastService);
  private cargando = inject(CargandoService);
  private formsService = inject(FormsService) as FormsService<VentaCliente>;
  private tabsState = inject(TabsStateService);
  private destroyRef = inject(DestroyRef);
  public dialogService = inject(DialogService);

  public listaClientes = this.clienteService.listaClientes;
  public subtitulo = 'Listado de clientes';
  public colDefs: ColDef[] = [];
  public ref: DynamicDialogRef<ClienteFormulario> | null = null;

  public exportarSignal = signal(false);
  public imprimirSignal = signal(false);

  ngOnInit(): void {
    this.clienteService.cargar().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    this.colDefs = this.clienteService.generarColumnasListado();
  }

  buscar(event: EventCrudBusqueda) {
    this.clienteService.cargar().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  exportarDesdeHeader() {
    this.exportarSignal.set(true);
  }

  imprimirDesdeHeader() {
    this.imprimirSignal.set(true);
  }

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
      header: 'Consultar Cliente',
      modal: true,
      width: '55vw',
      closable: true,
      maximizable: true,
      contentStyle: { overflow: 'auto' }
    });
  }

  cambiarEstados(event: { data: VentaCliente; estado: boolean }) {
    this.cargando.activar();
    if (event.data) {
      event.data.estado = event.estado;
      this.clienteService.actualizar(event.data)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (resultado) => {
            this.toast.success('El cliente ' + resultado.nombre + ' ha sido ' + (resultado.estado ? 'ACTIVADO' : 'INACTIVADO'));
            this.clienteService.actualizarElGrid(resultado);
            this.cargando.inactivar();
          }
        });
    }
  }

  eliminarObj(data: VentaCliente) {
    this.cargando.activar();
    if (data) {
      this.clienteService.eliminar(data)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.toast.success('El cliente ha sido eliminado.');
            this.clienteService.eliminarDelGrid(data);
            this.cargando.inactivar();
          }
        });
    }
  }
}
