import { Component, effect, inject, Input, OnInit } from '@angular/core';
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
import { FormsData } from '../../../../service/forms-data';

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
        PasswordComponent,
    ],
    templateUrl: './usuario-formulario.html',
    styleUrl: './usuario-formulario.scss',
})
export class UsuarioFormulario implements OnInit {

    @Input() esCrear = false;
    private fb = inject(FormBuilder);
    private toast = inject(ToastService);
    private usuariosService = inject(UsuariosService);
    private cargando = inject(CargandoService);
    public subtitulo = "";
    rol: any = null;
    formsData = inject(FormsData);

    usuarioForm = this.fb.group({
        usuApellidos: ['', [Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/)]],
        usuNombre: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/)]],
        usuUsername: ['', [Validators.required, Validators.pattern(/^\S+$/)]],
        usuEmail: ['', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\.[A-Za-z]{2,10}$/)]],
        usuClave: ['', [Validators.required]],
        usuTelefono: ['', []],
        usuDireccion: ['', []],
        rol: ['', [Validators.required]],
        usuEstado: [false, [Validators.required]],
    });

    roles = [
        { name: 'ADMINISTRADOR', code: 'ADM' },
        { name: 'SOPORTE', code: 'SOP' },
        { name: 'USUARIO', code: 'USU' },
        { name: 'BASICO', code: 'BAS' },
        { name: 'VENDEDOR', code: 'VEN' }
    ];

    constructor() {
        effect(() => {
            if (this.formsData && this.formsData.objetoSeleccionado() && !this.esCrear) {
                const usuario = this.formsData.objetoSeleccionado();
                if (usuario) {
                    this.usuarioForm.patchValue(this.formsData.objetoSeleccionado());
                }
            }
        });
    }

    ngOnInit(): void {
        if (this.esCrear) {
            this.subtitulo = 'Complete la información';
        } else {
            this.subtitulo = 'Actualización de datos';
        }
    }

    registrar() {
        if (this.usuarioForm.invalid) {
            this.usuarioForm.markAllAsTouched();
            this.toast.error('Complete los campos obligatorios!');
            return;
        }
        this.cargando.activar();
        this.usuariosService.guardar(this.usuarioForm.getRawValue() as ConfUsuario)
            .subscribe({
                next: (data) => this.despuesDeGuardar(data),
            });
    }

    actualizar() {
        if (this.usuarioForm.invalid) {
            this.usuarioForm.markAllAsTouched();
            this.toast.error('Complete los campos obligatorios!');
            return;
        }
        this.cargando.activar();
        this.usuariosService.guardar(this.usuarioForm.getRawValue() as ConfUsuario)
            .subscribe({
                next: (data) => this.despuesDeActualizar(data),
            });
    }

    despuesDeGuardar(data: ConfUsuario) {
        this.toast.success('El usuario se guardó correctamente');
        this.cargando.inactivar();
        this.usuariosService.agregarAlGrid(data);
    }

    despuesDeActualizar(data: ConfUsuario) {
        this.cargando.inactivar();
        this.usuariosService.actualizarElGrid(data);
    }

}
