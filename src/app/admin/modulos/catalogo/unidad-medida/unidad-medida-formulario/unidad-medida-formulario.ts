import { Component, computed, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { startWith } from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchComponent } from '../../../../component/toggle-switch/toggle-switch';
import { UnidadMedidaService } from '../unidad-medida.service';
import { FormsService } from '../../../../service/forms-service';
import { UtilService } from '../../../../service/util.service';
import { CargandoService } from '../../../../service/cargando.service';
import { ToastService } from '../../../../service/toast.service';
import { TabsStateService } from '../../../../service/tabs.service';
import { CatUnidadMedida } from '../../../../entities/CatUnidadMedida';
import { AccionEnum } from '../../../../enums/accion-enum';
import { TabsEnum } from '../../../../enums/tabs-enum';

@Component({
  selector: 'app-unidad-medida-formulario',
  standalone: true,
  imports: [ReactiveFormsModule, InputTextModule, ToggleSwitchComponent],
  templateUrl: './unidad-medida-formulario.html',
})
export class UnidadMedidaFormulario implements OnInit {

  private fb = inject(FormBuilder);
  private formsService = inject(FormsService) as FormsService<CatUnidadMedida>;
  private utilService = inject(UtilService);
  private cargando = inject(CargandoService);
  private toast = inject(ToastService);
  private unidadMedidaService = inject(UnidadMedidaService);
  private readonly destroyRef = inject(DestroyRef);
  public tabsState = inject(TabsStateService);

  public subtitulo = '';
  public accion = this.formsService.accion;
  public accionEnum = AccionEnum;

  public unidadForm = this.fb.group({
    codigo: ['', [Validators.required]],
    nombre: ['', [Validators.required]],
    abreviatura: ['', [Validators.required]],
    estado: [true, [Validators.required]],
  });

  private readonly _fv = toSignal(
    this.unidadForm.valueChanges.pipe(startWith(this.unidadForm.value)),
    { requireSync: true }
  );

  public readonly previewCodigo      = computed(() => this._fv().codigo?.trim()      ?? '');
  public readonly previewNombre      = computed(() => this._fv().nombre?.trim()      ?? '');
  public readonly previewAbreviatura = computed(() => this._fv().abreviatura?.trim() ?? '');
  public readonly previewEstado      = computed(() => this._fv().estado              ?? true);
  public readonly previewIniciales   = computed(() => {
    const n = this.previewNombre();
    if (!n) return '?';
    return n.split(' ').filter(Boolean).slice(0, 2).map(w => w.charAt(0).toUpperCase()).join('');
  });
  public readonly previewCompletadoPct = computed(() => {
    const v = this._fv();
    const campos = [v.codigo?.trim(), v.nombre?.trim(), v.abreviatura?.trim()];
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
        this.unidadForm.disable();
        break;
      case AccionEnum.EDITAR:
        this.subtitulo = 'Actualización de datos';
        this.cargarDatos();
        this.unidadForm.controls.codigo.disable();
        break;
      default:
        break;
    }
  }

  initForm() {
    this.unidadForm.enable();
    this.unidadForm.reset();
    this.unidadForm.controls.estado.setValue(true);
  }

  guardar(): void {
    this.realizarAccion();
  }

  irAlListado(): void {
    this.tabsState.irATab(TabsEnum.LISTADO);
  }

  realizarAccion() {
    if (!this.utilService.validarFormulario(this.unidadForm)) return;
    this.cargando.activar();
    if (this.accion() === AccionEnum.CREAR) {
      this.unidadMedidaService.guardar(this.unidadForm.getRawValue() as CatUnidadMedida)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (data) => {
            this.toast.success('La unidad de medida se guardó correctamente');
            this.cargando.inactivar();
            this.unidadMedidaService.agregarAlGrid(data);
            this.unidadForm.reset();
            this.unidadForm.controls.estado.setValue(true);
          }
        });
    } else {
      if (JSON.stringify(this.unidadForm.getRawValue()) !== JSON.stringify(this.formsService.objetoSeleccionado())) {
        this.unidadMedidaService.actualizar(this.unidadForm.getRawValue() as CatUnidadMedida)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (data) => {
              this.toast.success('La unidad de medida se actualizó correctamente');
              this.cargando.inactivar();
              this.unidadMedidaService.actualizarElGrid(data);
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
      this.unidadForm.patchValue(obj);
    }
  }
}
