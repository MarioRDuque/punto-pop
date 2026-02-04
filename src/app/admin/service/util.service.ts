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

  getAgGridPrintStyle(): string {
    return `
      table {
        width: 100%;
        border-collapse: collapse;
        font-family: var(--ag-font-family, Arial);
        font-size: 12px;
      }
  
      th {
        background-color: #f8f8f8;
        color: #000;
        font-weight: 600;
        border: 1px solid #d6d6d6;
        padding: 8px;
        text-align: left;
        white-space: nowrap;
      }
  
      td {
        border: 1px solid #d6d6d6;
        padding: 6px 8px;
        color: #000;
      }
  
      tr:nth-child(even) td {
        background-color: #fafafa;
      }
  
      tr:hover td {
        background-color: #eef2f6;
      }
  
      h3 {
        margin-bottom: 6px;
        font-weight: 600;
      }
  
      @page {
        margin: 15mm;
      }
    `;
  }


}
