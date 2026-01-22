import { Component, inject } from '@angular/core';
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
export class UsuarioFormulario {
    private fb = inject(FormBuilder);
    private toast = inject(ToastService);
    private usuariosService = inject(UsuariosService);
    private cargando = inject(CargandoService);

    rol: any = null;
    titulo = 'Registro de Usuario';
    subtitulo = 'Complete la información del nuevo usuario';

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

    registrar() {
        // this.cargando.activar();
        if (this.usuarioForm.invalid) {
            this.usuarioForm.markAllAsTouched();
            this.toast.error('Complete los campos obligatorios!');
            return;
        }
        this.usuariosService.guardar(this.usuarioForm.getRawValue() as any)
            .subscribe({
                // next: data => this.usuarios = data,
            });
    }

    roles = [
        { name: 'ADMINISTRADOR', code: 'ADM' },
        { name: 'SOPORTE', code: 'SOP' },
        { name: 'USUARIO', code: 'USU' },
        { name: 'PENDEJO', code: 'PEN' },
        { name: 'BASICO', code: 'BAS' },
        { name: 'VENDEDOR', code: 'VEN' }
    ];


}
