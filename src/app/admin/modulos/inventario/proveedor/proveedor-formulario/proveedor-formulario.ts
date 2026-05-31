import { Component, computed, DestroyRef, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { startWith } from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchComponent } from '../../../../component/toggle-switch/toggle-switch';
import { ProveedorService } from '../proveedor.service';
import { FormsService } from '../../../../service/forms-service';
import { UtilService } from '../../../../service/util.service';
import { CargandoService } from '../../../../service/cargando.service';
import { ToastService } from '../../../../service/toast.service';
import { TabsStateService } from '../../../../service/tabs.service';
import { Proveedor } from '../../../../entities/Proveedor';
import { AccionEnum } from '../../../../enums/accion-enum';
import { TabsEnum } from '../../../../enums/tabs-enum';
import { rucValidator } from '../../../../directives/identificacion-rules';

@Component({
  selector: 'app-proveedor-formulario',
  standalone: true,
  imports: [ReactiveFormsModule, InputTextModule, ToggleSwitchComponent],
  templateUrl: './proveedor-formulario.html',
})
export class ProveedorFormulario implements OnInit {

  @Input() modoDialog = false;
  @Output() proveedorGuardado = new EventEmitter<Proveedor>();

  private fb = inject(FormBuilder);
  private formsService = inject(FormsService) as FormsService<Proveedor>;
  private utilService = inject(UtilService);
  private cargando = inject(CargandoService);
  private toast = inject(ToastService);
  private proveedorService = inject(ProveedorService);
  private readonly destroyRef = inject(DestroyRef);
  public tabsState = inject(TabsStateService);

  public accion = this.formsService.accion;
  public accionEnum = AccionEnum;

  public readonly proveedorForm = this.fb.group({
    ruc:             ['', [Validators.required, rucValidator('EC')]],
    razonSocial:     ['', [Validators.required]],
    nombreComercial: [''],
    telefono:        [''],
    email:           ['', [Validators.email]],
    direccion:       [''],
    estado:          [true, [Validators.required]],
  });

  private readonly _fv = toSignal(
    this.proveedorForm.valueChanges.pipe(startWith(this.proveedorForm.value)),
    { requireSync: true }
  );

  public readonly previewRazonSocial    = computed(() => this._fv().razonSocial?.trim() ?? '');
  public readonly previewNombreComercial = computed(() => this._fv().nombreComercial?.trim() ?? '');
  public readonly previewIniciales = computed(() => {
    const n = this.previewRazonSocial();
    if (!n) return '?';
    return n.split(' ').filter(Boolean).slice(0, 2).map(w => w.charAt(0).toUpperCase()).join('');
  });
  public readonly previewEmail     = computed(() => this._fv().email?.trim() ?? '');
  public readonly previewTelefono  = computed(() => this._fv().telefono?.trim() ?? '');
  public readonly previewDireccion = computed(() => this._fv().direccion?.trim() ?? '');
  public readonly previewEstado    = computed(() => this._fv().estado ?? true);
  public readonly previewCompletadoPct = computed(() => {
    const v = this._fv();
    const campos = [
      v.ruc?.trim(),
      v.razonSocial?.trim(),
      v.email?.trim(),
      v.telefono?.trim(),
      v.direccion?.trim(),
    ];
    return Math.round((campos.filter(c => c && c.length > 0).length / campos.length) * 100);
  });

  public readonly rucMaxLength = 13;
  public readonly rucActualLength = computed(() => (this._fv().ruc ?? '').length);

  ngOnInit() {
    if (this.modoDialog) { this.initForm(); return; }
    switch (this.accion()) {
      case AccionEnum.CREAR:     this.initForm(); break;
      case AccionEnum.CONSULTAR: this.cargarDatos(); this.proveedorForm.disable(); break;
      case AccionEnum.EDITAR:    this.cargarDatos(); break;
    }
  }

  initForm() {
    this.proveedorForm.enable();
    this.proveedorForm.reset();
    this.proveedorForm.patchValue({ estado: true });
  }

  guardar(): void { this.realizarAccion(); }
  irAlListado(): void { this.tabsState.irATab(TabsEnum.LISTADO); }

  realizarAccion() {
    if (!this.utilService.validarFormulario(this.proveedorForm)) return;
    this.cargando.activar();
    const payload = this.proveedorForm.getRawValue() as Proveedor;

    if (this.accion() === AccionEnum.CREAR) {
      this.proveedorService.guardar(payload)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (data) => {
            this.toast.success('El proveedor se guardó correctamente');
            this.cargando.inactivar();
            this.proveedorService.agregarAlGrid(data);
            if (this.modoDialog) { this.proveedorGuardado.emit(data); } else { this.initForm(); }
          },
        });
    } else {
      this.proveedorService.actualizar(payload)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (data) => {
            this.toast.success('El proveedor se actualizó correctamente');
            this.cargando.inactivar();
            this.proveedorService.actualizarElGrid(data);
            this.tabsState.irATab(TabsEnum.LISTADO);
          },
        });
    }
  }

  cargarDatos() {
    const obj = this.formsService.objetoSeleccionado();
    if (obj) this.proveedorForm.patchValue(obj);
  }
}
