import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FileUploadModule } from 'primeng/fileupload';
import { FileUpload } from 'primeng/fileupload';
import { FileSelectEvent } from 'primeng/fileupload';
import { ICONSCONSTANT } from '../../constantes/icons-constants';

@Component({
  selector: 'app-fileupload',
  imports: [
    FileUploadModule
  ],
  templateUrl: './fileupload.html',
  styleUrl: './fileupload.scss',
})
export class FileuploadComponent implements OnChanges {

  @Input() fotoActual: string | null | undefined = null;
  @Input() readonly: boolean = false;
  @Output() fotoSeleccionada = new EventEmitter<string | null>();

  //IMAGEN
  preview: string | null = null;
  selectedFile: File | null = null;
  ICONSCONSTANT = ICONSCONSTANT;

  ngOnChanges() {
    if (this.fotoActual && !this.selectedFile) {
      this.preview = this.fotoActual;
    }
  }

  onSelectImage(event: FileSelectEvent) {
    if (this.readonly) return;
    const file: File = event.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.preview = reader.result as string;
      this.fotoSeleccionada.emit(this.preview);
    };
    reader.readAsDataURL(file);
    this.selectedFile = file;
  }

  removeImage(fileUploader: FileUpload) {
    if (this.readonly) return;
    if (this.preview && this.selectedFile) {
      URL.revokeObjectURL(this.preview);
    }
    this.preview = null;
    this.selectedFile = null;
    fileUploader.clear();
    this.fotoSeleccionada.emit(null);
  }
  //FIN IMAGEN

}
