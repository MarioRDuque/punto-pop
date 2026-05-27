import { inject, Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ToastService } from './toast.service';
import { ColDef } from 'ag-grid-community';
import { AccionButton } from '../component/accion-button/accion-button';

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

  getColumnaEstado(field: string, width = 90): ColDef {
    return {
      headerName: 'Estado',
      field,
      width,
      minWidth: width,
      maxWidth: width + 20,
      cellStyle: { display: 'flex', alignItems: 'center' },
      cellRenderer: (params: { value: boolean }) => {
        const on = params.value;
        const track = on ? '#16a34a' : '#d1d5db';
        const thumb = on ? 'right:2px' : 'left:2px';
        return `<div style="width:34px;height:18px;border-radius:9px;background:${track};position:relative;flex-shrink:0;cursor:default">
          <div style="position:absolute;top:2px;${thumb};width:14px;height:14px;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,0.25)"></div>
        </div>`;
      },
    };
  }

  getColumnaAcciones(): ColDef {
    return {
      colId: "acciones",
      headerName: "Opciones",
      cellRenderer: AccionButton,
      width: 70,
      minWidth: 70,
      maxWidth: 70
    };
  }

  sanitizeForPrint<T>(data: T[]): object[] {
    return data.map(row =>
      Object.fromEntries(
        Object.entries(row as object).map(([key, value]) => {
          if (typeof value === 'boolean') {
            return [key, value ? 'ACTIVO' : 'INACTIVO'];
          }
          if (value === null || value === undefined) {
            return [key, ''];
          }
          return [key, value];
        })
      )
    );
  }

}
