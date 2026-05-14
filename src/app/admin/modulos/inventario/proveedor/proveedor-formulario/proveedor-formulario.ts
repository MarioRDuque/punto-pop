import { Component, DestroyRef, inject, OnInit, effect } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FieldsetModule } from 'primeng/fieldset';
import { HeaderCrud } from '../../../../component/header-crud/header-crud';
import { InputComponent } from '../../../../component/input/input.component';
import { ToggleSwitchComponent } from '../../../../component/toggle-switch/toggle-switch';
import { ProveedorService } from '../proveedor.service';
import { ToastService } from '../../../../service/toast.service';
import { CargandoService } from '../../../../service/cargando.service';
import { FormsService } from '../../../../service/forms-service';
import { TabsStateService } from '../../../../service/tabs.service';
import { UtilService } from '../../../../service/util.service';
import { Proveedor } from '../../../../entities/Proveedor';
import { AccionEnum } from '../../../../enums/accion-enum';
import { TabsEnum } from '../../../../enums/tabs-enum';
import { rucValidator } from '../../../../directives/identificacion-rules';

@Component({
  selector: 'app-proveedor-formulario',
  standalone: true,
  imports: [ReactiveFormsModule, FieldsetModule, HeaderCrud, InputComponent, ToggleSwitchComponent],
  templateUrl: './proveedor-formulario.html',
})
export class ProveedorFormulario implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly proveedorService = inject(ProveedorService);
  private readonly toast = inject(ToastService);
  private readonly cargando = inject(CargandoService);
  private readonly formsService = inject(FormsService) as FormsService<Proveedor>;
  private readonly utilService = inject(UtilService);
  private readonly tabsState = inject(TabsStateService);
  private readonly destroyRef = inject(DestroyRef);

  public subtitulo = '';
  public readonly accion = this.formsService.accion;
  public readonly accionEnum = AccionEnum;

  public readonly proveedorForm = this.fb.group({
    ruc:             ['', [Validators.required, rucValidator('EC')]],
    razonSocial:     ['', [Validators.required]],
    nombreComercial: [''],
    telefono:        [''],
    email:           ['', [Validators.email]],
    direccion:       [''],
    estado:          [true],
  });

  constructor() {
    effect(() => {
      const obj = this.formsService.objetoSeleccionado();
      if (obj && this.accion() === AccionEnum.EDITAR) {
        this.proveedorForm.patchValue(obj);
      }
    });
  }

  ngOnInit(): void {
    if (this.accion() === AccionEnum.CREAR) {
      this.subtitulo = 'Nuevo proveedor';
      this.proveedorForm.reset({ estado: true });
    } else {
      this.subtitulo = 'Editar proveedor';
      const obj = this.formsService.objetoSeleccionado();
      if (obj) this.proveedorForm.patchValue(obj);
    }
  }

  realizarAccion(): void {
    if (!this.utilService.validarFormulario(this.proveedorForm)) return;
    this.cargando.activar();
    const value = this.proveedorForm.getRawValue();
    const proveedor: Proveedor = {
      ruc:             value.ruc ?? '',
      razonSocial:     value.razonSocial ?? '',
      nombreComercial: value.nombreComercial ?? undefined,
      telefono:        value.telefono ?? undefined,
      email:           value.email ?? undefined,
      direccion:       value.direccion ?? undefined,
      estado:          value.estado ?? true,
    };

    if (this.accion() === AccionEnum.CREAR) {
      this.proveedorService.guardar(proveedor)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (data) => {
            this.toast.success('Proveedor guardado correctamente');
            this.proveedorService.agregarAlGrid(data);
            this.cargando.inactivar();
            this.proveedorForm.reset({ estado: true });
          },
        });
    } else {
      const id = this.formsService.objetoSeleccionado()?.id;
      this.proveedorService.actualizar({ ...proveedor, id })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (data) => {
            this.toast.success('Proveedor actualizado correctamente');
            this.proveedorService.actualizarElGrid(data);
            this.cargando.inactivar();
            this.tabsState.irATab(TabsEnum.LISTADO);
          },
        });
    }
  }
}
