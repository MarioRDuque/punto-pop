import { Component } from '@angular/core';
import { FileUploadModule } from 'primeng/fileupload';

@Component({
  selector: 'app-fileupload',
  imports: [
    FileUploadModule
  ],
  templateUrl: './fileupload.html',
  styleUrl: './fileupload.scss',
})
export class Fileupload {

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
