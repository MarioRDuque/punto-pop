import { Component, DestroyRef, inject, OnInit, effect } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FileuploadComponent } from '../../../../component/fileupload/fileupload';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputComponent } from '../../../../component/input/input.component';
import { MultiselectComponent } from '../../../../component/multiselect/multiselect';
import { ToggleSwitchComponent } from '../../../../component/toggle-switch/toggle-switch';
import { PasswordComponent } from '../../../../component/password/password';
import { ToastService } from '../../../../service/toast.service';
import { UsuariosService } from '../usuarios.service';
import { CargandoService } from '../../../../service/cargando.service';
import { ConfUsuario, ConfRolResumen } from '../../../../entities/ConfUsuario';
import { FormsService } from '../../../../service/forms-service';
import { TabsStateService } from '../../../../service/tabs.service';
import { TabsEnum } from '../../../../enums/tabs-enum';
import { AccionEnum } from '../../../../enums/accion-enum';
import { ICONSCONSTANT } from '../../../../constantes/icons-constants';
import { UtilService } from '../../../../service/util.service';
import { RolService } from '../../rol/rol.service';
import { AuthService } from '../../../../service/auth.service';

const ROLES_ADMIN = ['ADMIN', 'SUPERADMIN'] as const;

@Component({
  selector: 'app-usuario-formulario',
  imports: [
    FileuploadComponent,
    ReactiveFormsModule,
    InputComponent,
    MultiselectComponent,
    ToggleSwitchComponent,
    PasswordComponent,
  ],
  templateUrl: './usuario-formulario.html',
  styleUrl: './usuario-formulario.scss',
})
export class UsuarioFormulario implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  private readonly usuariosService = inject(UsuariosService);
  private readonly cargando = inject(CargandoService);
  private readonly formsService = inject(FormsService) as FormsService<ConfUsuario>;
  private readonly utilService = inject(UtilService);
  private readonly tabsState = inject(TabsStateService);
  private readonly rolService = inject(RolService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  public subtitulo = '';
  public readonly accion = this.formsService.accion;
  public readonly accionEnum = AccionEnum;
  public readonly ICONSCONSTANT = ICONSCONSTANT;
  public readonly roles = this.rolService.listaRoles;

  public readonly usuarioForm = this.fb.group({
    usuApellidos: ['', [Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/)]],
    usuNombre: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/)]],
    usuEmail: ['', [Validators.required, Validators.pattern(/^\S+$/), Validators.email]],
    usuClave: ['', [Validators.required]],
    usuTelefono: [''],
    usuDireccion: [''],
    roles: [[] as ConfRolResumen[], [Validators.required]],
    usuEstado: [true, [Validators.required]],
    usuFoto: [null as string | null],
  });

  constructor() {
    // Re-parchar el formulario cuando objetoSeleccionado cambia
    // (el perfil carga primero desde sesión y luego refresca desde el backend)
    effect(() => {
      const obj = this.formsService.objetoSeleccionado();
      if (obj && this.accion() !== AccionEnum.CREAR) {
        this.patchFormulario(obj);
      }
    });
  }

  ngOnInit(): void {
    this.rolService.cargar().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();

    switch (this.accion()) {
      case AccionEnum.CREAR:
        this.subtitulo = 'Complete la información';
        this.initForm();
        break;
      case AccionEnum.CONSULTAR:
        this.subtitulo = 'Datos almacenados previamente';
        this.patchFormulario(this.formsService.objetoSeleccionado());
        this.usuarioForm.disable();
        break;
      case AccionEnum.EDITAR:
        this.subtitulo = 'Actualización de datos';
        this.patchFormulario(this.formsService.objetoSeleccionado());
        this.usuarioForm.controls.usuEmail.disable();
        break;
      case AccionEnum.PERFIL:
        this.subtitulo = 'Perfil';
        this.patchFormulario(this.formsService.objetoSeleccionado());
        this.usuarioForm.controls.usuEmail.disable();
        this.aplicarRestriccionesPerfil();
        break;
    }
  }

  initForm(): void {
    this.usuarioForm.enable();
    this.usuarioForm.reset();
    this.usuarioForm.controls.usuEstado.setValue(true);
  }

  guardar(): void {
    this.realizarAccion();
  }

  irAlListado(): void {
    this.tabsState.irATab(TabsEnum.LISTADO);
  }

  realizarAccion(): void {
    if (!this.utilService.validarFormulario(this.usuarioForm)) return;
    this.cargando.activar();

    const formValue = this.usuarioForm.getRawValue();
    const roles = this.normalizarRoles(formValue.roles ?? []);

    const usuario = new ConfUsuario({
      usuEmail: formValue.usuEmail ?? '',
      usuNombre: formValue.usuNombre ?? '',
      usuApellidos: formValue.usuApellidos ?? '',
      usuClave: formValue.usuClave ?? '',
      usuTelefono: formValue.usuTelefono ?? '',
      usuDireccion: formValue.usuDireccion ?? '',
      usuEstado: formValue.usuEstado ?? true,
      usuFoto: formValue.usuFoto ?? null,
      roles,
    });

    if (this.accion() === AccionEnum.CREAR) {
      this.usuariosService
        .guardar(usuario)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({ next: (data) => this.despuesDeGuardar(data) });
    } else {
      this.usuariosService
        .actualizar(usuario)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({ next: (data) => this.despuesDeActualizar(data) });
    }
  }

  // ── helpers ────────────────────────────────────────────────────────────────

  private patchFormulario(usuario: ConfUsuario | null): void {
    if (!usuario) return;
    const rolesCodigos = usuario.roles?.map((r) => r.rolCodigo) ?? [];
    this.usuarioForm.patchValue({
      ...usuario,
      roles: rolesCodigos as unknown as ConfRolResumen[],
      usuFoto: usuario.usuFoto ?? null,
    });
  }

  private normalizarRoles(roles: (ConfRolResumen | string)[]): ConfRolResumen[] {
    return roles.map((r) =>
      typeof r === 'string'
        ? { rolCodigo: r, rolDescripcion: '', rolEstado: true }
        : { rolCodigo: r.rolCodigo ?? '', rolDescripcion: r.rolDescripcion ?? '', rolEstado: r.rolEstado ?? true }
    );
  }

  private aplicarRestriccionesPerfil(): void {
    const esAdmin = this.formsService
      .objetoSeleccionado()
      ?.roles?.some((r) => (ROLES_ADMIN as readonly string[]).includes(r.rolCodigo));

    if (!esAdmin) {
      this.usuarioForm.controls.roles.disable();
      this.usuarioForm.controls.usuEstado.disable();
    }
  }

  private despuesDeGuardar(data: ConfUsuario): void {
    this.toast.success('El usuario se guardó correctamente');
    this.cargando.inactivar();
    this.usuariosService.agregarAlGrid(data);
    this.usuarioForm.reset();
  }

  private despuesDeActualizar(data: ConfUsuario): void {
    this.toast.success('El usuario se actualizó correctamente');
    this.cargando.inactivar();

    if (this.accion() === AccionEnum.PERFIL) {
      this.formsService.objetoSeleccionado.set(data);
      if (data.usuFoto !== undefined) {
        this.authService.actualizarFoto(data.usuFoto ?? null);
      }
    } else {
      this.usuariosService.actualizarElGrid(data);
      this.tabsState.irATab(TabsEnum.LISTADO);
    }
  }
}
