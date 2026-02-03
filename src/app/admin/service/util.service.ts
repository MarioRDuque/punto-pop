import { inject, Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class UtilService {

  private toast = inject(ToastService);

  validarFormulario(form: FormGroup): boolean {
    if (form.invalid) {
      form.markAllAsTouched();
      this.toast.error('Complete los campos obligatorios.');
      return false;
    }
    return true;
  }
}
