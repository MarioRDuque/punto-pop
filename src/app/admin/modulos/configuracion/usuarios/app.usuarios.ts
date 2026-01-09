import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
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
import { Tooltip } from 'primeng/tooltip';
import { FileUpload } from 'primeng/fileupload';
import { Image } from 'primeng/image';

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
        DatePickerModule,
        MultiSelectModule,
        PanelModule,
        AvatarModule,
        MenuModule,
        FloatLabelModule,
        PasswordModule,
        FieldsetModule,
        Tooltip,
        TableModule,
        FileUpload,
        Image
    ],
    templateUrl: './app.usuarios.html'
})
export class AppUsuarios implements OnInit {
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

    //IMAGEN
    preview: string | null = null;
    selectedFile: File | null = null;

    onSelectImage(event: any) {
        const file: File = event.files?.[0];
        if (!file) return;
        // Preview instantáneo
        this.preview = URL.createObjectURL(file);
        this.selectedFile = file;
    }

    removeImage(fileUploader: any) {
        if (this.preview) {
            URL.revokeObjectURL(this.preview);
        }
        this.preview = null;
        this.selectedFile = null;
        fileUploader.clear();
    }
    //FIN IMAGEN

}


