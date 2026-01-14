import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder,  ReactiveFormsModule, Validators } from '@angular/forms';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { FieldsetModule } from 'primeng/fieldset';
import { FloatLabelModule } from 'primeng/floatlabel';
import { FluidModule } from 'primeng/fluid';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { MultiSelectModule } from 'primeng/multiselect';
import { PanelModule } from 'primeng/panel';
import { PasswordModule } from 'primeng/password';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { CommonModule } from '@angular/common';
import { Fileupload } from "../../../component/fileupload/fileupload";
import { Errors } from '../../../directives/errors';
import { KeyFilterModule } from 'primeng/keyfilter';
import { ToastService } from '../../../service/toast.service';
import { HeaderCrud } from "../../../component/header-crud/header-crud";

@Component({
    selector: 'app-usuarios',
    standalone: true,
    imports: [
    ButtonModule,
    InputTextModule,
    FluidModule,
    InputIconModule,
    IconFieldModule,
    MultiSelectModule,
    PanelModule,
    AvatarModule,
    MenuModule,
    FloatLabelModule,
    PasswordModule,
    FieldsetModule,
    ToggleSwitch,
    CommonModule,
    Fileupload,
    Errors,
    ReactiveFormsModule,
    KeyFilterModule,
    HeaderCrud
],
    templateUrl: './app.usuarios.html'
})
export class AppUsuarios implements OnInit {
    private fb = inject(FormBuilder);
    rol: any = null;
    toast = inject(ToastService);

    ngOnInit() {
       
    }

    usuarioForm = this.fb.group({
        apellidos: ['', [Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/)]],
        nombre: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/)]],
        usuario: ['', [Validators.required]],
        correoElectronico: ['', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\.[A-Za-z]{2,10}$/)]],
        clave: ['', [Validators.required]],
        telefono: ['', []],
        direccion: ['', []],
        rol: ['', []],
        estado: [false, [Validators.required]],
    });

    registrar() {
        if (this.usuarioForm.invalid) {
            this.usuarioForm.markAllAsTouched();
            this.toast.error('Complete los campos obligatorios!');
            return;
        }
        // const data: RegistrarCliente = this.form.value as RegistrarCliente;
        // this.formDataSrv.setRegistrarCliente(data);
        // this.router.navigate(['/encontrar/cantidades']);
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


