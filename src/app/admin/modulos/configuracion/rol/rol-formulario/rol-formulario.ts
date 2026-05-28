import { Component, computed, inject, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { startWith } from 'rxjs';
import { HeaderCrud } from "../../../../component/header-crud/header-crud";
import { AccionEnum } from '../../../../enums/accion-enum';
import { FormsService } from '../../../../service/forms-service';
import { InputComponent } from "../../../../component/input/input.component";
import { ToggleSwitchComponent } from "../../../../component/toggle-switch/toggle-switch";
import { UtilService } from '../../../../service/util.service';
import { CargandoService } from '../../../../service/cargando.service';
import { ConfRol } from '../../../../entities/ConfRol';
import { ToastService } from '../../../../service/toast.service';
import { TabsEnum } from '../../../../enums/tabs-enum';
import { RolService } from '../rol.service';
import { TabsStateService } from '../../../../service/tabs.service';
import { MODULOS_PERMISOS } from '../../../../constantes/permisos.constants';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-rol-formulario',
  imports: [ReactiveFormsModule, FormsModule, HeaderCrud, InputComponent, ToggleSwitchComponent, CheckboxModule],
  templateUrl: './rol-formulario.html',
  styleUrl: './rol-formulario.scss',
})
export class RolFormulario implements OnInit {

  private fb = inject(FormBuilder);
  private formsService = inject(FormsService);
  private utilService = inject(UtilService);
  private cargando = inject(CargandoService);
  private toast = inject(ToastService);
  private rolService = inject(RolService);
  public tabsState = inject(TabsStateService);

  public subtitulo = "";
  public accion = this.formsService.accion;
  public accionEnum = AccionEnum;
  public modulos = MODULOS_PERMISOS;

  public rolForm = this.fb.group({
    rolCodigo: ['', [Validators.required]],
    rolDescripcion: ['', [Validators.required]],
    rolEstado: [true, [Validators.required]],
    permisos: [[] as string[]],
  });

  private readonly _fv = toSignal(
    this.rolForm.valueChanges.pipe(startWith(this.rolForm.value)),
    { requireSync: true }
  );
  public readonly previewEstado = computed(() => this._fv().rolEstado ?? true);

  ngOnInit() {
    switch (this.accion()) {
      case AccionEnum.CREAR:
        this.subtitulo = 'Complete la información';
        this.initForm();
        break;
      case AccionEnum.CONSULTAR:
        this.subtitulo = 'Datos almacenados previamente';
        this.consultaRol();
        this.rolForm.disable();
        break;
      case AccionEnum.EDITAR:
        this.subtitulo = 'Actualización de datos';
        this.consultaRol();
        this.rolForm.controls.rolCodigo.disable();
        break;
      default:
        break;
    }
  }

  initForm() {
    this.rolForm.enable();
    this.rolForm.reset();
    this.rolForm.controls.rolEstado.setValue(true);
    this.rolForm.controls.permisos.setValue([]);
  }

  tienePermiso(codigo: string): boolean {
    return (this.rolForm.controls.permisos.value ?? []).includes(codigo);
  }

  togglePermiso(codigo: string): void {
    const actual = this.rolForm.controls.permisos.value ?? [];
    const nuevo = actual.includes(codigo)
      ? actual.filter(p => p !== codigo)
      : [...actual, codigo];
    this.rolForm.controls.permisos.setValue(nuevo);
  }

  todoModuloActivo(modulo: string): boolean {
    const acciones = this.modulos.find(m => m.modulo === modulo)?.acciones ?? [];
    const actual = this.rolForm.controls.permisos.value ?? [];
    return acciones.length > 0 && acciones.every(a => actual.includes(a.codigo));
  }

  toggleModulo(modulo: string): void {
    const acciones = this.modulos.find(m => m.modulo === modulo)?.acciones ?? [];
    const actual = this.rolForm.controls.permisos.value ?? [];
    const todosActivos = acciones.every(a => actual.includes(a.codigo));
    const codigos = acciones.map(a => a.codigo);
    const nuevo = todosActivos
      ? actual.filter(p => !codigos.includes(p))
      : [...new Set([...actual, ...codigos])];
    this.rolForm.controls.permisos.setValue(nuevo);
  }

  guardar(): void {
    this.realizarAccion();
  }

  irAlListado(): void {
    this.tabsState.irATab(TabsEnum.LISTADO);
  }

  realizarAccion() {
    if (!this.utilService.validarFormulario(this.rolForm)) return;
    this.cargando.activar();
    const raw = this.rolForm.getRawValue() as ConfRol;
    if (this.accion() == AccionEnum.CREAR) {
      this.rolService.guardar(raw)
        .subscribe({ next: (data) => this.despuesDeGuardar(data) });
    } else {
      if (JSON.stringify(raw) != JSON.stringify(this.formsService.objetoSeleccionado())) {
        this.rolService.actualizar(raw)
          .subscribe({ next: (data) => this.despuesDeActualizar(data) });
      } else {
        this.cargando.inactivar();
        this.toast.info('NO HUBO CAMBIOS');
      }
    }
  }

  consultaRol() {
    const rol = this.formsService.objetoSeleccionado();
    if (rol) {
      this.rolForm.patchValue(rol);
    }
  }

  despuesDeGuardar(data: ConfRol) {
    this.toast.success('El rol se guardó correctamente');
    this.cargando.inactivar();
    this.rolService.agregarAlGrid(data);
    this.rolForm.reset();
  }

  despuesDeActualizar(data: ConfRol) {
    this.toast.success('El rol se actualizó correctamente');
    this.cargando.inactivar();
    this.rolService.actualizarElGrid(data);
    this.tabsState.irATab(TabsEnum.LISTADO);
  }
}
