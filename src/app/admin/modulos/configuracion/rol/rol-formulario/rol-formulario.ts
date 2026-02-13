import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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

@Component({
  selector: 'app-rol-formulario',
  imports: [ReactiveFormsModule, HeaderCrud, InputComponent, ToggleSwitchComponent],
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

  public rolForm = this.fb.group({
    rolCodigo: ['', [Validators.required]],
    rolDescripcion: ['', [Validators.required]],
    rolEstado: [true, [Validators.required]],
  });

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
  }

  realizarAccion() {
    if (!this.utilService.validarFormulario(this.rolForm)) return;
    this.cargando.activar();
    if (this.accion() == AccionEnum.CREAR) {
      //INSERTAR
      this.rolService.guardar(this.rolForm.getRawValue() as ConfRol)
        .subscribe({
          next: (data) => this.despuesDeGuardar(data),
        });
    } else {
      //ACTUALIZAR
      this.rolService.actualizar(this.rolForm.getRawValue() as ConfRol)
        .subscribe({
          next: (data) => this.despuesDeActualizar(data),
        });
    }
  }

  consultaRol() {
    const rol = this.formsService.objetoSeleccionado();
    if (rol) {
      this.rolForm.patchValue(this.formsService.objetoSeleccionado());
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
