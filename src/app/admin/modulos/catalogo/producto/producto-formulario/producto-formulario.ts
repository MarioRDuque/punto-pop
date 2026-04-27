import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HeaderCrud } from '../../../../component/header-crud/header-crud';
import { ProductoCampos } from '../producto-campos/producto-campos';
import { ProductoService } from '../producto.service';
import { FormsService } from '../../../../service/forms-service';
import { UtilService } from '../../../../service/util.service';
import { CargandoService } from '../../../../service/cargando.service';
import { ToastService } from '../../../../service/toast.service';
import { TabsStateService } from '../../../../service/tabs.service';
import { CatProducto } from '../../../../entities/CatProducto';
import { AccionEnum } from '../../../../enums/accion-enum';
import { TabsEnum } from '../../../../enums/tabs-enum';

@Component({
  selector: 'app-producto-formulario',
  standalone: true,
  imports: [ReactiveFormsModule, HeaderCrud, ProductoCampos],
  templateUrl: './producto-formulario.html',
})
export class ProductoFormulario implements OnInit {

  private fb             = inject(FormBuilder);
  private formsService   = inject(FormsService) as FormsService<CatProducto>;
  private utilService    = inject(UtilService);
  private cargando       = inject(CargandoService);
  private toast          = inject(ToastService);
  private productoService = inject(ProductoService);
  private readonly destroyRef = inject(DestroyRef);
  public tabsState = inject(TabsStateService);

  public subtitulo = '';
  public accion    = this.formsService.accion;
  public accionEnum = AccionEnum;

  public productoForm = this.fb.group({
    id:             [null as string | null],
    codigo:         ['', [Validators.required]],
    nombre:         ['', [Validators.required]],
    descripcion:    [''],
    precioVenta:    [0, [Validators.required, Validators.min(0)]],
    costo:          [null as number | null],
    stock:          [0, [Validators.required, Validators.min(0)]],
    stockMinimo:    [0, [Validators.required, Validators.min(0)]],
    categoriaId:    [null as string | null, [Validators.required]],
    unidadMedidaId: [null as string | null, [Validators.required]],
    tarifaIvaId:    [null as string | null, [Validators.required]],
    estado:         [true, [Validators.required]],
  });

  ngOnInit(): void {
    switch (this.accion()) {
      case AccionEnum.CREAR:
        this.subtitulo = 'Complete la información';
        this.initForm();
        break;
      case AccionEnum.CONSULTAR:
        this.subtitulo = 'Datos almacenados previamente';
        this.cargarDatos();
        this.productoForm.disable();
        break;
      case AccionEnum.EDITAR:
        this.subtitulo = 'Actualización de datos';
        this.cargarDatos();
        this.productoForm.controls.codigo.disable();
        break;
    }
  }

  realizarAccion(): void {
    if (!this.utilService.validarFormulario(this.productoForm)) return;
    this.cargando.activar();

    if (this.accion() === AccionEnum.CREAR) {
      this.productoService.guardar(this.productoForm.getRawValue() as CatProducto)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (data) => {
            this.toast.success('El producto se guardó correctamente');
            this.cargando.inactivar();
            this.productoService.agregarAlGrid(data);
            this.initForm();
          },
        });
    } else {
      if (JSON.stringify(this.productoForm.getRawValue()) !== JSON.stringify(this.formsService.objetoSeleccionado())) {
        this.productoService.actualizar(this.productoForm.getRawValue() as CatProducto)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (data) => {
              this.toast.success('El producto se actualizó correctamente');
              this.cargando.inactivar();
              this.productoService.actualizarElGrid(data);
              this.tabsState.irATab(TabsEnum.LISTADO);
            },
          });
      } else {
        this.cargando.inactivar();
        this.toast.info('NO HUBO CAMBIOS');
      }
    }
  }

  private initForm(): void {
    this.productoForm.enable();
    this.productoForm.reset();
    this.productoForm.controls.estado.setValue(true);
    this.productoForm.controls.precioVenta.setValue(0);
    this.productoForm.controls.stock.setValue(0);
    this.productoForm.controls.stockMinimo.setValue(0);
  }

  private cargarDatos(): void {
    const obj = this.formsService.objetoSeleccionado() as CatProducto | null;
    if (obj) this.productoForm.patchValue(obj as any);
  }
}
