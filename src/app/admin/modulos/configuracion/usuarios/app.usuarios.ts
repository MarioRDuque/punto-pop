import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AvatarModule } from 'primeng/avatar';
import { FieldsetModule } from 'primeng/fieldset';
import { FloatLabelModule } from 'primeng/floatlabel';
import { FluidModule } from 'primeng/fluid';
import { MultiSelectModule } from 'primeng/multiselect';
import { PanelModule } from 'primeng/panel';
import { PasswordModule } from 'primeng/password';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { CommonModule } from '@angular/common';
import { Fileupload } from "../../../component/fileupload/fileupload";
import { Errors } from '../../../directives/errors';
import { ToastService } from '../../../service/toast.service';
import { HeaderCrud } from "../../../component/header-crud/header-crud";
import { UsuariosService } from './usuarios.service';
import { CargandoService } from '../../../service/cargando.service';
import { InputComponent } from "../../../component/input/input.component";

@Component({
    selector: 'app-usuarios',
    standalone: true,
    imports: [
        FluidModule,
        MultiSelectModule,
        PanelModule,
        AvatarModule,
        FloatLabelModule,
        PasswordModule,
        FieldsetModule,
        ToggleSwitch,
        CommonModule,
        Fileupload,
        Errors,
        ReactiveFormsModule,
        HeaderCrud,
        InputComponent
    ],
    templateUrl: './app.usuarios.html'
})
export class AppUsuarios implements OnInit {

    private fb = inject(FormBuilder);
    private toast = inject(ToastService);
    private usuariosService = inject(UsuariosService);
    private cargando = inject(CargandoService);

    rol: any = null;

    ngOnInit() {

    }

    usuarioForm = this.fb.group({
        apellidos: ['', [Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/)]],
        nombre: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/)]],
        usuario: ['', [Validators.required, Validators.pattern(/^\S+$/)]],
        correoElectronico: ['', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\.[A-Za-z]{2,10}$/)]],
        clave: ['', [Validators.required]],
        telefono: ['', []],
        direccion: ['', []],
        rol: ['', []],
        estado: [false, [Validators.required]],
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
                // error: err => console.error(err),
                // complete: () => this.loading = false
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


