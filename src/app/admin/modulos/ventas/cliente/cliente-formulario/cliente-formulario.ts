import { Component, computed, DestroyRef, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { startWith } from 'rxjs';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchComponent } from '../../../../component/toggle-switch/toggle-switch';
import { ClienteService } from '../cliente.service';
import { FormsService } from '../../../../service/forms-service';
import { UtilService } from '../../../../service/util.service';
import { CargandoService } from '../../../../service/cargando.service';
import { ToastService } from '../../../../service/toast.service';
import { TabsStateService } from '../../../../service/tabs.service';
import { VentaCliente, TipoIdentificacion } from '../../../../entities/VentaCliente';
import { AccionEnum } from '../../../../enums/accion-enum';
import { TabsEnum } from '../../../../enums/tabs-enum';
import { identificacionValidator } from '../../../../directives/identificacion-rules';

@Component({
  selector: 'app-cliente-formulario',
  standalone: true,
  imports: [ReactiveFormsModule, InputTextModule, ToggleSwitchComponent, SelectModule],
  templateUrl: './cliente-formulario.html',
})
export class ClienteFormulario implements OnInit {

  @Input() modoDialog = false;
  @Output() clienteGuardado = new EventEmitter<VentaCliente>();

  private fb = inject(FormBuilder);
  private formsService = inject(FormsService) as FormsService<VentaCliente>;
  private utilService = inject(UtilService);
  private cargando = inject(CargandoService);
  private toast = inject(ToastService);
  private clienteService = inject(ClienteService);
  private readonly destroyRef = inject(DestroyRef);
  public tabsState = inject(TabsStateService);

  public accion = this.formsService.accion;
  public accionEnum = AccionEnum;

  public readonly tiposIdentificacion: { label: string; value: TipoIdentificacion }[] = [
    { label: 'Cédula', value: 'CEDULA' },
    { label: 'RUC', value: 'RUC' },
    { label: 'Pasaporte', value: 'PASAPORTE' },
  ];

  public readonly paises = ['Ecuador', 'Colombia', 'Perú', 'Estados Unidos', 'Otro'];

  public readonly provincias = [
    'Azuay', 'Bolívar', 'Cañar', 'Carchi', 'Chimborazo', 'Cotopaxi',
    'El Oro', 'Esmeraldas', 'Galápagos', 'Guayas', 'Imbabura', 'Loja',
    'Los Ríos', 'Manabí', 'Morona Santiago', 'Napo', 'Orellana', 'Pastaza',
    'Pichincha', 'Santa Elena', 'Santo Domingo', 'Sucumbíos', 'Tungurahua', 'Zamora Chinchipe',
  ];

  public clienteForm = this.fb.group({
    id:                 [null as string | null],
    tipoIdentificacion: ['CEDULA' as TipoIdentificacion, [Validators.required]],
    identificacion:     ['', [Validators.required, identificacionValidator('EC')]],
    nombre:             ['', [Validators.required]],
    email:              [''],
    telefono:           [''],
    pais:               ['Ecuador'],
    provincia:          [''],
    ciudad:             [''],
    direccion:          [''],
    estado:             [true, [Validators.required]],
  });

  private readonly _fv = toSignal(
    this.clienteForm.valueChanges.pipe(startWith(this.clienteForm.value)),
    { requireSync: true }
  );

  // Preview signals
  public readonly previewNombre      = computed(() => this._fv().nombre?.trim() ?? '');
  public readonly previewIniciales   = computed(() => {
    const n = this.previewNombre();
    if (!n) return '?';
    return n.split(' ').filter(Boolean).slice(0, 2).map(w => w.charAt(0).toUpperCase()).join('');
  });
  public readonly previewEmail       = computed(() => this._fv().email?.trim() ?? '');
  public readonly previewTelefono    = computed(() => this._fv().telefono?.trim() ?? '');
  public readonly previewUbicacion   = computed(() => {
    const v = this._fv();
    return [v.ciudad, v.provincia].filter(Boolean).join(', ') || v.direccion?.trim() || '';
  });
  public readonly previewTipoId      = computed(() => {
    const labels: Record<string, string> = { CEDULA: 'Cédula', RUC: 'RUC', PASAPORTE: 'Pasaporte' };
    return labels[this._fv().tipoIdentificacion ?? ''] ?? '';
  });
  public readonly previewEstado      = computed(() => this._fv().estado ?? true);
  public readonly previewCompletadoPct = computed(() => {
    const v = this._fv();
    const campos = [
      v.nombre?.trim(),
      v.identificacion?.trim(),
      v.email?.trim(),
      v.telefono?.trim(),
      (v.direccion?.trim() || v.ciudad?.trim()),
    ];
    const llenos = campos.filter(c => c && c.length > 0).length;
    return Math.round((llenos / campos.length) * 100);
  });

  // ID counter
  public readonly idMaxLength    = computed(() => {
    const tipo = this._fv().tipoIdentificacion;
    if (tipo === 'RUC') return 13;
    if (tipo === 'PASAPORTE') return 20;
    return 10;
  });
  public readonly idActualLength = computed(() => (this._fv().identificacion ?? '').length);

  constructor() {
    this.clienteForm.controls.tipoIdentificacion.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.clienteForm.controls.identificacion.updateValueAndValidity({ emitEvent: false });
      });
  }

  ngOnInit() {
    if (this.modoDialog) { this.initForm(); return; }
    switch (this.accion()) {
      case AccionEnum.CREAR:     this.initForm(); break;
      case AccionEnum.CONSULTAR: this.cargarDatos(); this.clienteForm.disable(); break;
      case AccionEnum.EDITAR:    this.cargarDatos(); break;
    }
  }

  initForm() {
    this.clienteForm.enable();
    this.clienteForm.reset();
    this.clienteForm.patchValue({ estado: true, tipoIdentificacion: 'CEDULA', pais: 'Ecuador' });
  }

  guardar():      void { this.realizarAccion(); }
  irAlListado():  void { this.tabsState.irATab(TabsEnum.LISTADO); }

  realizarAccion() {
    if (!this.utilService.validarFormulario(this.clienteForm)) return;
    this.cargando.activar();
    const raw = this.clienteForm.getRawValue();
    const payload = raw as VentaCliente;

    if (this.accion() === AccionEnum.CREAR) {
      this.clienteService.guardar(payload)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (data) => {
            this.toast.success('El cliente se guardó correctamente');
            this.cargando.inactivar();
            this.clienteService.agregarAlGrid(data);
            if (this.modoDialog) { this.clienteGuardado.emit(data); } else { this.initForm(); }
          },
        });
    } else {
      this.clienteService.actualizar(payload)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (data) => {
            this.toast.success('El cliente se actualizó correctamente');
            this.cargando.inactivar();
            this.clienteService.actualizarElGrid(data);
            this.tabsState.irATab(TabsEnum.LISTADO);
          },
        });
    }
  }

  cargarDatos() {
    const obj = this.formsService.objetoSeleccionado();
    if (obj) this.clienteForm.patchValue(obj);
  }
}
