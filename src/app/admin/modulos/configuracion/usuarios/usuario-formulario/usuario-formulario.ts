import { Component, inject, OnInit } from '@angular/core';
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

    public subtitulo = "";
    public accion = this.formsService.accion;
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
        rol: [[], [Validators.required]],
        usuEstado: [true, [Validators.required]],
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
                break;
            default:
                break;
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
        if (this.accion() == AccionEnum.CREAR) {
            //INSERTAR
            this.usuariosService.guardar(this.usuarioForm.getRawValue() as ConfUsuario)
                .subscribe({
                    next: (data) => this.despuesDeGuardar(data),
                });
        } else {
            //ACTUALIZAR
            if (JSON.stringify(this.usuarioForm.getRawValue()) != JSON.stringify(this.formsService.objetoSeleccionado())) {
                this.usuariosService.actualizar(this.usuarioForm.getRawValue() as ConfUsuario)
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
            this.usuarioForm.patchValue(this.formsService.objetoSeleccionado());
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
        } else {
            this.usuariosService.actualizarElGrid(data);
            this.tabsState.irATab(TabsEnum.LISTADO);
        }
        this.cargando.inactivar();
    }

}
