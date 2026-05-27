import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Grid } from '../../../../component/grid/grid';
import { ListadoToolbar, ToolbarTab } from '../../../../component/listado-toolbar/listado-toolbar';
import { UsuariosService } from '../usuarios.service';
import { ColDef } from 'ag-grid-enterprise';
import { EventCrudBusqueda } from '../../../../enums/event-crud-busqueda';
import { ConfUsuario } from '../../../../entities/ConfUsuario';
import { ToastService } from '../../../../service/toast.service';
import { CargandoService } from '../../../../service/cargando.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { UsuarioFormulario } from '../usuario-formulario/usuario-formulario';
import { FormsService } from '../../../../service/forms-service';
import { AccionEnum } from '../../../../enums/accion-enum';
import { TabsStateService } from '../../../../service/tabs.service';
import { TabsEnum } from '../../../../enums/tabs-enum';

type FilterType = 'todos' | 'activos' | 'inactivos';

@Component({
  selector: 'app-usuario-listado',
  imports: [CommonModule, FormsModule, Grid, ListadoToolbar],
  templateUrl: './usuario-listado.html',
  providers: [DialogService],
})
export class UsuarioListado implements OnInit {

  private readonly usuariosService = inject(UsuariosService);
  private readonly toast = inject(ToastService);
  private readonly cargando = inject(CargandoService);
  private readonly formsService = inject(FormsService);
  private readonly tabsState = inject(TabsStateService);
  private readonly destroyRef = inject(DestroyRef);
  public readonly dialogService = inject(DialogService);

  public readonly listaUsuarios = this.usuariosService.usuarios;
  public readonly subtitulo = 'Listado de usuarios';
  public colDefs: ColDef[] = [];
  public ref: DynamicDialogRef<UsuarioFormulario> | null = null;

  public readonly exportarSignal = signal(false);
  public readonly imprimirSignal = signal(false);

  readonly searchQuery = signal('');
  readonly activeFilter = signal<FilterType>('todos');

  readonly counts = computed(() => {
    const list = this.listaUsuarios();
    return {
      todos: list.length,
      activos: list.filter(u => u.usuEstado).length,
      inactivos: list.filter(u => !u.usuEstado).length,
    };
  });

  readonly tabs = computed<ToolbarTab[]>(() => [
    { key: 'todos',     label: 'Todos',     count: this.counts().todos },
    { key: 'activos',   label: 'Activos',   count: this.counts().activos },
    { key: 'inactivos', label: 'Inactivos', count: this.counts().inactivos },
  ]);

  readonly filteredUsuarios = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const tab = this.activeFilter();
    return this.listaUsuarios().filter(u => {
      const matchTab = tab === 'todos' ? true : tab === 'activos' ? u.usuEstado : !u.usuEstado;
      if (!matchTab) return false;
      if (!q) return true;
      return u.usuNombre?.toLowerCase().includes(q) ||
        u.usuApellidos?.toLowerCase().includes(q) ||
        u.usuEmail?.toLowerCase().includes(q);
    });
  });

  ngOnInit(): void {
    this.usuariosService.cargar().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    this.colDefs = this.usuariosService.generarColumnasListado();
  }

  setFilter(tab: FilterType) { this.activeFilter.set(tab); }
  onSearch(q: string) { this.searchQuery.set(q); }

  buscar(event: EventCrudBusqueda): void {
    this.usuariosService
      .cargar(event.filtro, event.texto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  exportarDesdeHeader(): void {
    this.exportarSignal.set(true);
  }

  imprimirDesdeHeader(): void {
    this.imprimirSignal.set(true);
  }

  editarObj(data: ConfUsuario): void {
    this.formsService.seleccionarObjeto(data);
    this.formsService.accion.set(AccionEnum.EDITAR);
    this.tabsState.cambiarEstadoTab(false);
    this.tabsState.irATab(TabsEnum.EDITAR);
  }

  consultarObj(data: ConfUsuario): void {
    this.formsService.seleccionarObjeto(data);
    this.formsService.accion.set(AccionEnum.CONSULTAR);
    this.ref = this.dialogService.open(UsuarioFormulario, {
      header: 'Consultar Usuario',
      modal: true,
      width: '50vw',
      closable: true,
      maximizable: true,
      contentStyle: { overflow: 'auto' },
    });
  }

  cambiarEstados(event: { data: ConfUsuario; estado: boolean }): void {
    if (!event.data) return;
    this.cargando.activar();
    event.data.usuEstado = event.estado;
    this.usuariosService
      .actualizar(event.data)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (data) => this.despuesDeCambiarEstado(data) });
  }

  eliminarObj(data: ConfUsuario): void {
    if (!data) return;
    this.cargando.activar();
    this.usuariosService
      .eliminar(data)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: () => this.despuesDeEliminar(data) });
  }

  private despuesDeCambiarEstado(data: ConfUsuario): void {
    this.toast.success(
      `El usuario ${data.usuEmail} ha sido ➔ ${data.usuEstado ? 'ACTIVADO' : 'INACTIVADO'}`
    );
    this.usuariosService.actualizarElGrid(data);
    this.cargando.inactivar();
  }

  private despuesDeEliminar(data: ConfUsuario): void {
    this.toast.success('El usuario ha sido eliminado.');
    this.usuariosService.eliminarDelGrid(data);
    this.cargando.inactivar();
  }
}
