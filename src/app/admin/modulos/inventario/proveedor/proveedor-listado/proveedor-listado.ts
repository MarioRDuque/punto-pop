import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ColDef } from 'ag-grid-enterprise';
import { Grid } from '../../../../component/grid/grid';
import { ListadoToolbar, ToolbarTab } from '../../../../component/listado-toolbar/listado-toolbar';
import { ProveedorService } from '../proveedor.service';
import { ProveedorFormulario } from '../proveedor-formulario/proveedor-formulario';
import { ToastService } from '../../../../service/toast.service';
import { CargandoService } from '../../../../service/cargando.service';
import { FormsService } from '../../../../service/forms-service';
import { TabsStateService } from '../../../../service/tabs.service';
import { Proveedor } from '../../../../entities/Proveedor';
import { EventCrudBusqueda } from '../../../../enums/event-crud-busqueda';
import { AccionEnum } from '../../../../enums/accion-enum';
import { TabsEnum } from '../../../../enums/tabs-enum';

type FilterType = 'todos' | 'activos' | 'inactivos' | 'incompletos';

@Component({
  selector: 'app-proveedor-listado',
  standalone: true,
  imports: [CommonModule, FormsModule, Grid, ListadoToolbar],
  templateUrl: './proveedor-listado.html',
  providers: [DialogService],
})
export class ProveedorListado implements OnInit {

  private readonly proveedorService = inject(ProveedorService);
  private readonly toast            = inject(ToastService);
  private readonly cargando         = inject(CargandoService);
  private readonly formsService     = inject(FormsService) as FormsService<Proveedor>;
  private readonly tabsState        = inject(TabsStateService);
  private readonly destroyRef       = inject(DestroyRef);
  public  readonly dialogService    = inject(DialogService);

  public readonly subtitulo = 'Listado de proveedores';
  public colDefs: ColDef[] = [];
  public ref: DynamicDialogRef<ProveedorFormulario> | null = null;

  public readonly exportarSignal = signal(false);
  public readonly imprimirSignal = signal(false);

  readonly searchQuery  = signal('');
  readonly activeFilter = signal<FilterType>('todos');

  private readonly listaProveedores = this.proveedorService.listaProveedores;

  readonly counts = computed(() => {
    const list = this.listaProveedores();
    return {
      todos:       list.length,
      activos:     list.filter(p =>  p.estado).length,
      inactivos:   list.filter(p => !p.estado).length,
      incompletos: list.filter(p => !p.email || !p.telefono).length,
    };
  });

  readonly tabs = computed<ToolbarTab[]>(() => [
    { key: 'todos',       label: 'Todos',       count: this.counts().todos },
    { key: 'activos',     label: 'Activos',      count: this.counts().activos },
    { key: 'inactivos',   label: 'Inactivos',    count: this.counts().inactivos },
    { key: 'incompletos', label: 'Incompletos',  count: this.counts().incompletos },
  ]);

  readonly filteredProveedores = computed(() => {
    const q   = this.searchQuery().toLowerCase().trim();
    const tab = this.activeFilter();
    return this.listaProveedores().filter(p => {
      const matchTab =
        tab === 'todos'       ? true
        : tab === 'activos'   ? p.estado
        : tab === 'inactivos' ? !p.estado
        : !p.email || !p.telefono;
      if (!matchTab) return false;
      if (!q) return true;
      return (
        p.ruc?.toLowerCase().includes(q) ||
        p.razonSocial?.toLowerCase().includes(q) ||
        p.nombreComercial?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        p.telefono?.toLowerCase().includes(q)
      );
    });
  });

  ngOnInit(): void {
    this.proveedorService.cargar().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    this.colDefs = this.proveedorService.generarColumnasListado();
  }

  setFilter(tab: FilterType) { this.activeFilter.set(tab); }
  onSearch(q: string)        { this.searchQuery.set(q); }

  buscar(event: EventCrudBusqueda): void {
    this.proveedorService.cargar(event.texto).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  exportarDesdeHeader(): void { this.exportarSignal.set(true); }
  imprimirDesdeHeader(): void { this.imprimirSignal.set(true); }

  editarObj(data: Proveedor): void {
    this.formsService.seleccionarObjeto(data);
    this.formsService.accion.set(AccionEnum.EDITAR);
    this.tabsState.cambiarEstadoTab(false);
    this.tabsState.irATab(TabsEnum.EDITAR);
  }

  consultarObj(data: Proveedor): void {
    this.formsService.seleccionarObjeto(data);
    this.formsService.accion.set(AccionEnum.CONSULTAR);
    this.ref = this.dialogService.open(ProveedorFormulario, {
      header: 'Detalle de proveedor',
      modal: true,
      width: '55vw',
      closable: true,
      maximizable: true,
      contentStyle: { overflow: 'auto' },
    });
  }

  cambiarEstados(event: { data: Proveedor; estado: boolean }): void {
    if (!event.data) return;
    this.cargando.activar();
    const actualizado = { ...event.data, estado: event.estado };
    this.proveedorService
      .actualizar(actualizado)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.toast.success(`Proveedor ${data.razonSocial} → ${data.estado ? 'ACTIVO' : 'INACTIVO'}`);
          this.proveedorService.actualizarElGrid(data);
          this.cargando.inactivar();
        },
      });
  }

  eliminarObj(data: Proveedor): void {
    if (!data?.id) return;
    this.cargando.activar();
    this.proveedorService
      .eliminar(data)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toast.success('Proveedor eliminado');
          this.proveedorService.eliminarDelGrid(data);
          this.cargando.inactivar();
        },
      });
  }
}
