import { Component, DestroyRef, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { FloatLabelModule } from 'primeng/floatlabel';
import { HeaderCrud } from '../../../../component/header-crud/header-crud';
import { InputComponent } from '../../../../component/input/input.component';
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

@Component({
  selector: 'app-cliente-formulario',
  standalone: true,
  imports: [ReactiveFormsModule, HeaderCrud, InputComponent, ToggleSwitchComponent, SelectModule, FloatLabelModule],
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

  public subtitulo = '';
  public accion = this.formsService.accion;
  public accionEnum = AccionEnum;

  public tiposIdentificacion: { label: string; value: TipoIdentificacion }[] = [
    { label: 'Cédula', value: 'CEDULA' },
    { label: 'RUC', value: 'RUC' },
    { label: 'Pasaporte', value: 'PASAPORTE' },
  ];

  public clienteForm = this.fb.group({
    id: [null as string | null],
    tipoIdentificacion: ['CEDULA' as TipoIdentificacion, [Validators.required]],
    identificacion: ['', [Validators.required]],
    nombre: ['', [Validators.required]],
    email: [''],
    telefono: [''],
    direccion: [''],
    estado: [true, [Validators.required]],
  });

  ngOnInit() {
    if (this.modoDialog) {
      this.subtitulo = 'Complete la información';
      this.initForm();
      return;
    }
    switch (this.accion()) {
      case AccionEnum.CREAR:
        this.subtitulo = 'Complete la información';
        this.initForm();
        break;
      case AccionEnum.CONSULTAR:
        this.subtitulo = 'Datos almacenados previamente';
        this.cargarDatos();
        this.clienteForm.disable();
        break;
      case AccionEnum.EDITAR:
        this.subtitulo = 'Actualización de datos';
        this.cargarDatos();
        break;
      default:
        break;
    }
  }

  initForm() {
    this.clienteForm.enable();
    this.clienteForm.reset();
    this.clienteForm.controls.estado.setValue(true);
    this.clienteForm.controls.tipoIdentificacion.setValue('CEDULA');
  }

  realizarAccion() {
    if (!this.utilService.validarFormulario(this.clienteForm)) return;
    this.cargando.activar();
    if (this.accion() === AccionEnum.CREAR) {
      this.clienteService.guardar(this.clienteForm.getRawValue() as VentaCliente)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (data) => {
            this.toast.success('El cliente se guardó correctamente');
            this.cargando.inactivar();
            this.clienteService.agregarAlGrid(data);
            if (this.modoDialog) {
              this.clienteGuardado.emit(data);
            } else {
              this.initForm();
            }
          }
        });
    } else {
      if (JSON.stringify(this.clienteForm.getRawValue()) !== JSON.stringify(this.formsService.objetoSeleccionado())) {
        this.clienteService.actualizar(this.clienteForm.getRawValue() as VentaCliente)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (data) => {
              this.toast.success('El cliente se actualizó correctamente');
              this.cargando.inactivar();
              this.clienteService.actualizarElGrid(data);
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
      this.clienteForm.patchValue(obj);
    }
  }
}
