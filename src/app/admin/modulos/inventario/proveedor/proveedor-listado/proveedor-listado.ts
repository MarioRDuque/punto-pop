import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ColDef } from 'ag-grid-enterprise';
import { HeaderCrud } from '../../../../component/header-crud/header-crud';
import { Grid } from '../../../../component/grid/grid';
import { ProveedorService } from '../proveedor.service';
import { ToastService } from '../../../../service/toast.service';
import { CargandoService } from '../../../../service/cargando.service';
import { FormsService } from '../../../../service/forms-service';
import { TabsStateService } from '../../../../service/tabs.service';
import { Proveedor } from '../../../../entities/Proveedor';
import { EventCrudBusqueda } from '../../../../enums/event-crud-busqueda';
import { AccionEnum } from '../../../../enums/accion-enum';
import { TabsEnum } from '../../../../enums/tabs-enum';

@Component({
  selector: 'app-proveedor-listado',
  standalone: true,
  imports: [HeaderCrud, Grid],
  templateUrl: './proveedor-listado.html',
})
export class ProveedorListado implements OnInit {

  private readonly proveedorService = inject(ProveedorService);
  private readonly toast = inject(ToastService);
  private readonly cargando = inject(CargandoService);
  private readonly formsService = inject(FormsService);
  private readonly tabsState = inject(TabsStateService);
  private readonly destroyRef = inject(DestroyRef);

  public readonly listaProveedores = this.proveedorService.listaProveedores;
  public readonly subtitulo = 'Listado de proveedores';
  public colDefs: ColDef[] = [];

  public readonly exportarSignal = signal(false);
  public readonly imprimirSignal = signal(false);

  ngOnInit(): void {
    this.proveedorService.cargar().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    this.colDefs = this.proveedorService.generarColumnasListado();
  }

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
