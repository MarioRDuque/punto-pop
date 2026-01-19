import { Component } from '@angular/core';
import { FileUploadModule } from 'primeng/fileupload';
import { FileUpload } from 'primeng/fileupload';
import { FileSelectEvent } from 'primeng/fileupload';

@Component({
  selector: 'app-fileupload',
  imports: [
    FileUploadModule
  ],
  templateUrl: './fileupload.html',
  styleUrl: './fileupload.scss',
})
export class FileuploadComponent {

  //IMAGEN
  preview: string | null = null;
  selectedFile: File | null = null;

  onSelectImage(event: FileSelectEvent) {
    const file: File = event.files?.[0];
    if (!file) return;
    // Preview instantáneo
    this.preview = URL.createObjectURL(file);
    this.selectedFile = file;
  }

  removeImage(fileUploader: FileUpload) {
    if (this.preview) {
      URL.revokeObjectURL(this.preview);
    }
    this.preview = null;
    this.selectedFile = null;
    fileUploader.clear();
  }
  //FIN IMAGEN

}
