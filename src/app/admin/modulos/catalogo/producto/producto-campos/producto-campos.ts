import { Component, DestroyRef, inject, Input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';
import { ControlContainer, FormBuilder, FormGroup, FormGroupDirective, ReactiveFormsModule, Validators } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { InputComponent } from '../../../../component/input/input.component';
import { ToggleSwitchComponent } from '../../../../component/toggle-switch/toggle-switch';
import { CategoriaService } from '../../categoria/categoria.service';
import { UnidadMedidaService } from '../../unidad-medida/unidad-medida.service';
import { TarifaIvaService } from '../../tarifa-iva/tarifa-iva.service';
import { UtilService } from '../../../../service/util.service';
import { CargandoService } from '../../../../service/cargando.service';
import { ToastService } from '../../../../service/toast.service';
import { CatCategoria } from '../../../../entities/CatCategoria';
import { CatUnidadMedida } from '../../../../entities/CatUnidadMedida';
import { AccionEnum } from '../../../../enums/accion-enum';

export type ModoProductoCampos = 'completo' | 'rapido';

@Component({
  selector: 'app-producto-campos',
  standalone: true,
  viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }],
  imports: [
    ReactiveFormsModule,
    InputComponent,
    ToggleSwitchComponent,
    SelectModule,
    InputNumberModule,
    ButtonModule,
    DialogModule,
    TooltipModule,
  ],
  templateUrl: './producto-campos.html',
})
export class ProductoCampos implements OnInit {

  @Input() modo: ModoProductoCampos = 'completo';
  @Input() accion?: AccionEnum;

  readonly accionEnum = AccionEnum;

  private controlContainer = inject(ControlContainer);
  private fb               = inject(FormBuilder);
  private categoriaService = inject(CategoriaService);
  private unidadService    = inject(UnidadMedidaService);
  private tarifaIvaService = inject(TarifaIvaService);
  private utilService      = inject(UtilService);
  private cargando         = inject(CargandoService);
  private toast            = inject(ToastService);
  private destroyRef       = inject(DestroyRef);

  public categorias  = this.categoriaService.listaCategorias;
  public unidades    = this.unidadService.listaUnidades;
  public tarifasIva  = this.tarifaIvaService.listaTarifas;

  public dialogCategoriaVisible = signal(false);
  public dialogUnidadVisible    = signal(false);
  public readonly previewEstado = signal(true);

  public categoriaForm = this.fb.group({
    codigo:      ['', [Validators.required]],
    nombre:      ['', [Validators.required]],
    descripcion: [''],
  });

  public unidadForm = this.fb.group({
    codigo:      ['', [Validators.required]],
    nombre:      ['', [Validators.required]],
    abreviatura: ['', [Validators.required]],
  });

  get form(): FormGroup {
    return this.controlContainer.control as FormGroup;
  }

  ngOnInit(): void {
    if (this.categorias().length === 0)
      this.categoriaService.cargar().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    if (this.unidades().length === 0)
      this.unidadService.cargar().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    if (this.tarifasIva().length === 0)
      this.tarifaIvaService.cargar().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();

    this.form.get('estado')?.valueChanges
      .pipe(startWith(this.form.get('estado')?.value), takeUntilDestroyed(this.destroyRef))
      .subscribe(v => this.previewEstado.set(v ?? true));
  }

  refrescarCategorias(): void {
    this.categoriaService.cargar().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.toast.info('Categorías actualizadas'),
    });
  }

  refrescarUnidades(): void {
    this.unidadService.cargar().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.toast.info('Unidades actualizadas'),
    });
  }

  abrirDialogCategoria(): void {
    this.categoriaForm.reset();
    this.dialogCategoriaVisible.set(true);
  }

  abrirDialogUnidad(): void {
    this.unidadForm.reset();
    this.dialogUnidadVisible.set(true);
  }

  guardarCategoria(): void {
    if (!this.utilService.validarFormulario(this.categoriaForm)) return;
    this.cargando.activar();
    const v = this.categoriaForm.getRawValue();
    const categoria: CatCategoria = {
      codigo:      v.codigo      ?? '',
      nombre:      v.nombre      ?? '',
      descripcion: v.descripcion ?? undefined,
      estado:      true,
    };
    this.categoriaService.guardar(categoria)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.toast.success(`Categoría "${data.nombre}" creada`);
          this.categoriaService.agregarAlGrid(data);
          this.form.get('categoriaId')?.setValue(data.codigo ?? null);
          this.dialogCategoriaVisible.set(false);
          this.cargando.inactivar();
        },
      });
  }

  guardarUnidad(): void {
    if (!this.utilService.validarFormulario(this.unidadForm)) return;
    this.cargando.activar();
    const v = this.unidadForm.getRawValue();
    const unidad: CatUnidadMedida = {
      codigo:      v.codigo      ?? '',
      nombre:      v.nombre      ?? '',
      abreviatura: v.abreviatura ?? '',
      estado:      true,
    };
    this.unidadService.guardar(unidad)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.toast.success(`Unidad "${data.nombre}" creada`);
          this.unidadService.agregarAlGrid(data);
          this.form.get('unidadMedidaId')?.setValue(data.codigo ?? null);
          this.dialogUnidadVisible.set(false);
          this.cargando.inactivar();
        },
      });
  }
}
