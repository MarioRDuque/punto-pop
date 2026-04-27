import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ColDef } from 'ag-grid-community';
import { HeaderCrud } from '../../../../component/header-crud/header-crud';
import { Grid } from '../../../../component/grid/grid';
import { ProductoService } from '../producto.service';
import { ProductoFormulario } from '../producto-formulario/producto-formulario';
import { ToastService } from '../../../../service/toast.service';
import { CargandoService } from '../../../../service/cargando.service';
import { FormsService } from '../../../../service/forms-service';
import { TabsStateService } from '../../../../service/tabs.service';
import { CatProducto } from '../../../../entities/CatProducto';
import { AccionEnum } from '../../../../enums/accion-enum';
import { TabsEnum } from '../../../../enums/tabs-enum';
import { EventCrudBusqueda } from '../../../../enums/event-crud-busqueda';

@Component({
  selector: 'app-producto-listado',
  standalone: true,
  imports: [HeaderCrud, Grid],
  templateUrl: './producto-listado.html',
  providers: [DialogService]
})
export class ProductoListado implements OnInit {

  private productoService = inject(ProductoService);
  private toast = inject(ToastService);
  private cargando = inject(CargandoService);
  private formsService = inject(FormsService) as FormsService<CatProducto>;
  private tabsState = inject(TabsStateService);
  private destroyRef = inject(DestroyRef);
  public dialogService = inject(DialogService);

  public listaProductos = this.productoService.listaProductos;
  public subtitulo = 'Listado de productos';
  public colDefs: ColDef[] = [];
  public ref: DynamicDialogRef<ProductoFormulario> | null = null;

  public exportarSignal = signal(false);
  public imprimirSignal = signal(false);

  ngOnInit(): void {
    this.productoService.cargar().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    this.colDefs = this.productoService.generarColumnasListado();
  }

  buscar(event: EventCrudBusqueda) {
    this.productoService.cargar().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  exportarDesdeHeader() {
    this.exportarSignal.set(true);
  }

  imprimirDesdeHeader() {
    this.imprimirSignal.set(true);
  }

  editarObj(data: CatProducto) {
    this.formsService.seleccionarObjeto(data);
    this.formsService.accion.set(AccionEnum.EDITAR);
    this.tabsState.cambiarEstadoTab(false);
    this.tabsState.irATab(TabsEnum.EDITAR);
  }

  consultarObj(data: CatProducto) {
    this.formsService.seleccionarObjeto(data);
    this.formsService.accion.set(AccionEnum.CONSULTAR);
    this.ref = this.dialogService.open(ProductoFormulario, {
      header: 'Consultar Producto',
      modal: true,
      width: '70vw',
      closable: true,
      maximizable: true,
      contentStyle: { overflow: 'auto' }
    });
  }

  cambiarEstados(event: { data: CatProducto; estado: boolean }) {
    this.cargando.activar();
    if (event.data) {
      event.data.estado = event.estado;
      this.productoService.actualizar(event.data)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (resultado) => {
            this.toast.success('El producto ' + resultado.nombre + ' ha sido ' + (resultado.estado ? 'ACTIVADO' : 'INACTIVADO'));
            this.productoService.actualizarElGrid(resultado);
            this.cargando.inactivar();
          }
        });
    }
  }

  eliminarObj(data: CatProducto) {
    this.cargando.activar();
    if (data) {
      this.productoService.eliminar(data)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.toast.success('El producto ha sido eliminado.');
            this.productoService.eliminarDelGrid(data);
            this.cargando.inactivar();
          }
        });
    }
  }
}
