import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ColDef } from 'ag-grid-community';
import { HeaderCrud } from '../../../../component/header-crud/header-crud';
import { Grid } from '../../../../component/grid/grid';
import { CategoriaService } from '../categoria.service';
import { CategoriaFormulario } from '../categoria-formulario/categoria-formulario';
import { ToastService } from '../../../../service/toast.service';
import { CargandoService } from '../../../../service/cargando.service';
import { FormsService } from '../../../../service/forms-service';
import { TabsStateService } from '../../../../service/tabs.service';
import { CatCategoria } from '../../../../entities/CatCategoria';
import { AccionEnum } from '../../../../enums/accion-enum';
import { TabsEnum } from '../../../../enums/tabs-enum';
import { EventCrudBusqueda } from '../../../../enums/event-crud-busqueda';

@Component({
  selector: 'app-categoria-listado',
  standalone: true,
  imports: [HeaderCrud, Grid],
  templateUrl: './categoria-listado.html',
  providers: [DialogService]
})
export class CategoriaListado implements OnInit {

  private categoriaService = inject(CategoriaService);
  private toast = inject(ToastService);
  private cargando = inject(CargandoService);
  private formsService = inject(FormsService) as FormsService<CatCategoria>;
  private tabsState = inject(TabsStateService);
  private destroyRef = inject(DestroyRef);
  public dialogService = inject(DialogService);

  public listaCategorias = this.categoriaService.listaCategorias;
  public subtitulo = 'Listado de categorías';
  public colDefs: ColDef[] = [];
  public ref: DynamicDialogRef<CategoriaFormulario> | null = null;

  public exportarSignal = signal(false);
  public imprimirSignal = signal(false);

  ngOnInit(): void {
    this.categoriaService.cargar().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    this.colDefs = this.categoriaService.generarColumnasListado();
  }

  buscar(event: EventCrudBusqueda) {
    this.categoriaService.cargar().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  exportarDesdeHeader() {
    this.exportarSignal.set(true);
  }

  imprimirDesdeHeader() {
    this.imprimirSignal.set(true);
  }

  editarObj(data: CatCategoria) {
    this.formsService.seleccionarObjeto(data);
    this.formsService.accion.set(AccionEnum.EDITAR);
    this.tabsState.cambiarEstadoTab(false);
    this.tabsState.irATab(TabsEnum.EDITAR);
  }

  consultarObj(data: CatCategoria) {
    this.formsService.seleccionarObjeto(data);
    this.formsService.accion.set(AccionEnum.CONSULTAR);
    this.ref = this.dialogService.open(CategoriaFormulario, {
      header: 'Consultar Categoría',
      modal: true,
      width: '50vw',
      closable: true,
      maximizable: true,
      contentStyle: { overflow: 'auto' }
    });
  }

  cambiarEstados(event: { data: CatCategoria; estado: boolean }) {
    this.cargando.activar();
    if (event.data) {
      event.data.estado = event.estado;
      this.categoriaService.actualizar(event.data)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (resultado) => {
            this.toast.success('La categoría ' + resultado.nombre + ' ha sido ' + (resultado.estado ? 'ACTIVADA' : 'INACTIVADA'));
            this.categoriaService.actualizarElGrid(resultado);
            this.cargando.inactivar();
          }
        });
    }
  }

  eliminarObj(data: CatCategoria) {
    this.cargando.activar();
    if (data) {
      this.categoriaService.eliminar(data)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.toast.success('La categoría ha sido eliminada.');
            this.categoriaService.eliminarDelGrid(data);
            this.cargando.inactivar();
          }
        });
    }
  }
}
