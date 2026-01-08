import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { InputTextModule } from 'primeng/inputtext';
import { FluidModule } from 'primeng/fluid';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { CommonModule } from '@angular/common';
import { DatePickerModule } from 'primeng/datepicker';
import { Country } from '../../../modulos/service/customer.service';
import { MultiSelectModule } from 'primeng/multiselect';
import { ToolbarModule } from 'primeng/toolbar';
import { SplitButtonModule } from 'primeng/splitbutton';
import { MenuItem } from 'primeng/api';
import { PanelModule } from 'primeng/panel';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { FileUploadModule } from 'primeng/fileupload';

@Component({
    selector: 'app-usuarios',
    standalone: true,

    imports: [
        ButtonModule,
        RouterModule,
        RippleModule,
        InputTextModule,
        FluidModule,
        SelectModule,
        FormsModule,
        TextareaModule,
        InputIconModule,
        IconFieldModule,
        ToggleButtonModule,
        CommonModule,
        DatePickerModule,
        MultiSelectModule,
        ToolbarModule,
        SplitButtonModule,
        PanelModule,
        AvatarModule,
        MenuModule,
        FileUploadModule
    ],
    templateUrl: './app.usuarios.html'
})
export class AppUsuarios implements OnInit{
    toggleValue = false;
    calendarValue: any = null;

    dropdownValues = [
        { name: 'ADMINISTRADOR', code: 'ADM' },
        { name: 'SOPORTE', code: 'SOP' },
        { name: 'USUARIO', code: 'USU' },
        { name: 'PENDEJO', code: 'PEN' },
        { name: 'BASICO', code: 'BAS' },
        { name: 'VENDEDOR', code: 'VEN' }
    ];
    dropdownValue: any = null;
    dropdownItem = null;

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
}


