import { Component, computed, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { startWith } from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchComponent } from '../../../../component/toggle-switch/toggle-switch';
import { CategoriaService } from '../categoria.service';
import { FormsService } from '../../../../service/forms-service';
import { UtilService } from '../../../../service/util.service';
import { CargandoService } from '../../../../service/cargando.service';
import { ToastService } from '../../../../service/toast.service';
import { TabsStateService } from '../../../../service/tabs.service';
import { CatCategoria } from '../../../../entities/CatCategoria';
import { AccionEnum } from '../../../../enums/accion-enum';
import { TabsEnum } from '../../../../enums/tabs-enum';

@Component({
  selector: 'app-categoria-formulario',
  standalone: true,
  imports: [ReactiveFormsModule, InputTextModule, ToggleSwitchComponent],
  templateUrl: './categoria-formulario.html',
})
export class CategoriaFormulario implements OnInit {

  private fb = inject(FormBuilder);
  private formsService = inject(FormsService) as FormsService<CatCategoria>;
  private utilService = inject(UtilService);
  private cargando = inject(CargandoService);
  private toast = inject(ToastService);
  private categoriaService = inject(CategoriaService);
  private readonly destroyRef = inject(DestroyRef);
  public tabsState = inject(TabsStateService);

  public subtitulo = '';
  public accion = this.formsService.accion;
  public accionEnum = AccionEnum;

  public categoriaForm = this.fb.group({
    id: [null as string | null],
    codigo: ['', [Validators.required]],
    nombre: ['', [Validators.required]],
    descripcion: [''],
    estado: [true, [Validators.required]],
  });

  private readonly _fv = toSignal(
    this.categoriaForm.valueChanges.pipe(startWith(this.categoriaForm.value)),
    { requireSync: true }
  );

  public readonly previewCodigo      = computed(() => this._fv().codigo?.trim()      ?? '');
  public readonly previewNombre      = computed(() => this._fv().nombre?.trim()      ?? '');
  public readonly previewDescripcion = computed(() => this._fv().descripcion?.trim() ?? '');
  public readonly previewEstado      = computed(() => this._fv().estado              ?? true);
  public readonly previewIniciales   = computed(() => {
    const n = this.previewNombre();
    if (!n) return '?';
    return n.split(' ').filter(Boolean).slice(0, 2).map(w => w.charAt(0).toUpperCase()).join('');
  });
  public readonly previewCompletadoPct = computed(() => {
    const v = this._fv();
    const campos = [v.codigo?.trim(), v.nombre?.trim(), v.descripcion?.trim()];
    return Math.round((campos.filter(c => c && c.length > 0).length / campos.length) * 100);
  });

  ngOnInit() {
    switch (this.accion()) {
      case AccionEnum.CREAR:
        this.subtitulo = 'Complete la información';
        this.initForm();
        break;
      case AccionEnum.CONSULTAR:
        this.subtitulo = 'Datos almacenados previamente';
        this.cargarDatos();
        this.categoriaForm.disable();
        break;
      case AccionEnum.EDITAR:
        this.subtitulo = 'Actualización de datos';
        this.cargarDatos();
        this.categoriaForm.controls.codigo.disable();
        break;
      default:
        break;
    }
  }

  initForm() {
    this.categoriaForm.enable();
    this.categoriaForm.reset();
    this.categoriaForm.controls.estado.setValue(true);
  }

  guardar(): void {
    this.realizarAccion();
  }

  irAlListado(): void {
    this.tabsState.irATab(TabsEnum.LISTADO);
  }

  realizarAccion() {
    if (!this.utilService.validarFormulario(this.categoriaForm)) return;
    this.cargando.activar();
    if (this.accion() === AccionEnum.CREAR) {
      this.categoriaService.guardar(this.categoriaForm.getRawValue() as CatCategoria)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (data) => {
            this.toast.success('La categoría se guardó correctamente');
            this.cargando.inactivar();
            this.categoriaService.agregarAlGrid(data);
            this.categoriaForm.reset();
            this.categoriaForm.controls.estado.setValue(true);
          }
        });
    } else {
      if (JSON.stringify(this.categoriaForm.getRawValue()) !== JSON.stringify(this.formsService.objetoSeleccionado())) {
        this.categoriaService.actualizar(this.categoriaForm.getRawValue() as CatCategoria)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (data) => {
              this.toast.success('La categoría se actualizó correctamente');
              this.cargando.inactivar();
              this.categoriaService.actualizarElGrid(data);
              this.tabsState.irATab(TabsEnum.LISTADO);
            }
          });
      } else {
        this.cargando.inactivar();
        this.toast.info('NO HUBO CAMBIOS');
      }
    }
  }

  cargarDatos() {
    const obj = this.formsService.objetoSeleccionado();
    if (obj) {
      this.categoriaForm.patchValue(obj);
    }
  }
}
