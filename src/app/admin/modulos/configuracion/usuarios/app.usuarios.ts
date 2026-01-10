import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MenuItem } from 'primeng/api';
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
import { TableModule } from 'primeng/table';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { CommonModule } from '@angular/common';
import { Fileupload } from "../../../component/fileupload/fileupload";
import { Errors } from '../../../component/directives/errors';

@Component({
    selector: 'app-usuarios',
    standalone: true,
    imports: [
        ButtonModule,
        InputTextModule,
        FluidModule,
        FormsModule,
        InputIconModule,
        IconFieldModule,
        ToggleButtonModule,
        MultiSelectModule,
        PanelModule,
        AvatarModule,
        MenuModule,
        FloatLabelModule,
        PasswordModule,
        FieldsetModule,
        TableModule,
        ToggleSwitch,
        CommonModule,
        Fileupload,
        Errors,
        ReactiveFormsModule
    ],
    templateUrl: './app.usuarios.html'
})
export class AppUsuarios implements OnInit {
    toggleValue = false;
    calendarValue: any = null;
    estado: boolean = false;
    private fb = inject(FormBuilder);
    rol: any = null;
    items: MenuItem[] | undefined;

    ngOnInit() {
        this.items = [
            {
                label: 'Update',
                icon: 'pi pi-refresh'
            },
            {
                label: 'Delete',
                icon: 'pi pi-times'
            }
        ];
    }

    usuarioForm = this.fb.group({
        apellidos: ['', [Validators.required]],
        nombre: ['', [Validators.required]],
        usuario: ['', [Validators.required]],
        correoElectronico: ['', [Validators.required]],
        clave: ['', [Validators.required]],
        telefono: ['', [Validators.required]],
        direccion: ['', [Validators.required]],
        rol: ['', [Validators.required]],
        estado: [false, [Validators.required]],
    });

    registrar() {
        if (this.usuarioForm.invalid) {
            this.usuarioForm.markAllAsTouched();
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


