import { Component, inject, OnInit, effect } from '@angular/core';
import { FileuploadComponent } from '../../../../component/fileupload/fileupload';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HeaderCrud } from '../../../../component/header-crud/header-crud';
import { InputComponent } from '../../../../component/input/input.component';
import { MultiselectComponent } from '../../../../component/multiselect/multiselect';
import { ToggleSwitchComponent } from '../../../../component/toggle-switch/toggle-switch';
import { PasswordComponent } from '../../../../component/password/password';
import { FluidModule } from 'primeng/fluid';
import { PanelModule } from 'primeng/panel';
import { FieldsetModule } from 'primeng/fieldset';
import { ToastService } from '../../../../service/toast.service';
import { UsuariosService } from '../usuarios.service';
import { CargandoService } from '../../../../service/cargando.service';
import { ConfUsuario } from '../../../../entities/ConfUsuario';
import { FormsService } from '../../../../service/forms-service';
import { TabsStateService } from '../../../../service/tabs.service';
import { TabsEnum } from '../../../../enums/tabs-enum';
import { AccionEnum } from '../../../../enums/accion-enum';
import { ICONSCONSTANT } from '../../../../constantes/icons-constants';
import { UtilService } from '../../../../service/util.service';
import { RolService } from '../../rol/rol.service';
import { AuthService } from '../../../../service/auth.service';

@Component({
    selector: 'app-usuario-formulario',
    imports: [
        FluidModule,
        PanelModule,
        FieldsetModule,
        FileuploadComponent,
        ReactiveFormsModule,
        HeaderCrud,
        InputComponent,
        MultiselectComponent,
        ToggleSwitchComponent,
        PasswordComponent
    ],
    templateUrl: './usuario-formulario.html',
    styleUrl: './usuario-formulario.scss',
})
export class UsuarioFormulario implements OnInit {

    private fb = inject(FormBuilder);
    private toast = inject(ToastService);
    private usuariosService = inject(UsuariosService);
    private cargando = inject(CargandoService);
    private formsService = inject(FormsService);
    private utilService = inject(UtilService);
    public tabsState = inject(TabsStateService);
    private rolService = inject(RolService);
    private authService = inject(AuthService);

    public subtitulo = "";
    public accion = this.formsService.accion;

    constructor() {
        // Re-parchar el formulario cuando el backend actualiza objetoSeleccionado
        // (el perfil carga datos de sesión primero y luego actualiza desde el backend)
        effect(() => {
            const obj = this.formsService.objetoSeleccionado();
            if (obj && this.accion() !== AccionEnum.CREAR) {
                this.consultaUsuario();
            }
        });
    }
    public accionEnum = AccionEnum;
    ICONSCONSTANT = ICONSCONSTANT;
    public roles = this.rolService.listaRoles;

    public usuarioForm = this.fb.group({
        usuApellidos: ['', [Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/)]],
        usuNombre: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/)]],
        usuUsername: ['', [Validators.required, Validators.pattern(/^\S+$/)]],
        usuEmail: ['', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\.[A-Za-z]{2,10}$/)]],
        usuClave: ['', [Validators.required]],
        usuTelefono: ['', []],
        usuDireccion: ['', []],
        roles: [[] as any[], [Validators.required]],
        usuEstado: [true, [Validators.required]],
        usuFoto: [null as string | null],
    });

    ngOnInit() {
        this.rolService.cargar();
        switch (this.accion()) {
            case AccionEnum.CREAR:
                this.subtitulo = 'Complete la información';
                this.initForm();
                break;
            case AccionEnum.CONSULTAR:
                this.subtitulo = 'Datos almacenados previamente';
                this.consultaUsuario();
                this.usuarioForm.disable();
                break;
            case AccionEnum.EDITAR:
                this.subtitulo = 'Actualización de datos';
                this.consultaUsuario();
                this.usuarioForm.controls.usuUsername.disable();
                break;
            case AccionEnum.PERFIL:
                this.subtitulo = 'Perfil';
                this.consultaUsuario();
                this.usuarioForm.controls.usuUsername.disable();
                // Deshabilitar rol y estado para usuarios no-admin (después de cargar datos)
                this.aplicarRestriccionesPerfil();
                break;
            default:
                break;
        }
    }

    /**
     * Aplica restricciones de edición para el perfil según el rol del usuario
     * Los usuarios no-admin no pueden modificar su rol ni su estado
     */
    aplicarRestriccionesPerfil() {
        const usuario = this.formsService.objetoSeleccionado();
        // Los roles pueden venir como objetos {rolCodigo} o como strings desde la sesión
        const tienePermisoAdmin = usuario?.roles?.some(
            (rol: any) => {
                const codigo = typeof rol === 'string' ? rol : (rol.rolCodigo || '');
                return codigo === 'ADMIN' || codigo === 'SUPERADMIN';
            }
        );

        if (!tienePermisoAdmin) {
            this.usuarioForm.controls.roles.disable();
            this.usuarioForm.controls.usuEstado.disable();
        }
    }

    initForm() {
        this.usuarioForm.enable();
        this.usuarioForm.reset();
        this.usuarioForm.controls.usuEstado.setValue(true);
    }

    realizarAccion() {
        if (!this.utilService.validarFormulario(this.usuarioForm)) return;
        this.cargando.activar();
        
        // Obtener valores del formulario
        const formValue = this.usuarioForm.getRawValue();
        
        // Convertir los códigos de roles a objetos que el backend puede deserializar
        const rolesArray = Array.isArray(formValue.roles) ? formValue.roles : [];
        const rolesObjetos = rolesArray.map((rol: any) => ({
            rolCodigo: typeof rol === 'string' ? rol : (rol?.rolCodigo ?? ''),
            rolDescripcion: typeof rol === 'object' ? (rol?.rolDescripcion ?? '') : '',
            rolEstado: typeof rol === 'object' ? (rol?.rolEstado ?? true) : true
        }));
        
        const usuario = new ConfUsuario({
            usuUsername: formValue.usuUsername || '',
            usuNombre: formValue.usuNombre || '',
            usuApellidos: formValue.usuApellidos || '',
            usuEmail: formValue.usuEmail || '',
            usuClave: formValue.usuClave || '',
            usuTelefono: formValue.usuTelefono || '',
            usuDireccion: formValue.usuDireccion || '',
            usuEstado: formValue.usuEstado ?? true,
            usuFoto: formValue.usuFoto ?? null,
            roles: rolesObjetos
        });
        
        if (this.accion() == AccionEnum.CREAR) {
            //INSERTAR
            this.usuariosService.guardar(usuario)
                .subscribe({
                    next: (data) => this.despuesDeGuardar(data),
                });
        } else {
            //ACTUALIZAR
            if (JSON.stringify(usuario) != JSON.stringify(this.formsService.objetoSeleccionado())) {
                this.usuariosService.actualizar(usuario)
                    .subscribe({
                        next: (data) => this.despuesDeActualizar(data),
                    });
            } else {
                this.cargando.inactivar();
                this.toast.info('NO HUBO CAMBIOS');
            }
        }
    }

    consultaUsuario() {
        const usuario = this.formsService.objetoSeleccionado();
        if (usuario) {
            const rolesParaFormulario = usuario.roles?.map((rol: any) => rol.rolCodigo || rol) || [];
            this.usuarioForm.patchValue({
                ...usuario,
                roles: rolesParaFormulario,
                usuFoto: usuario.usuFoto ?? null
            });
        }
    }

    despuesDeGuardar(data: ConfUsuario) {
        this.toast.success('El usuario se guardó correctamente');
        this.cargando.inactivar();
        this.usuariosService.agregarAlGrid(data);
        this.usuarioForm.reset();
    }

    despuesDeActualizar(data: ConfUsuario) {
        this.toast.success('El usuario se actualizó correctamente');
        if (this.accion() == AccionEnum.PERFIL) {
            this.formsService.objetoSeleccionado.set(data);
            // Actualizar foto en la sesión para que el topbar y el avatar la reflejen
            if (data.usuFoto !== undefined) {
                this.authService.actualizarFoto(data.usuFoto ?? null);
            }
        } else {
            this.usuariosService.actualizarElGrid(data);
            this.tabsState.irATab(TabsEnum.LISTADO);
        }
        this.cargando.inactivar();
    }

}
