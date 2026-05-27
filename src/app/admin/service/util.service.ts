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

  getColumnaEstado(field: string, width = 110): ColDef {
    return {
      headerName: 'Estado',
      field,
      width,
      minWidth: width,
      maxWidth: width + 20,
      cellStyle: { display: 'flex', alignItems: 'center' },
      valueFormatter: (params: { value: boolean }) => params.value ? 'Activo' : 'Inactivo',
      cellRenderer: (params: { value: boolean }) => {
        const on = params.value;
        const bg   = on ? '#dcfce7' : '#f3f4f6';
        const dot  = on ? '#16a34a' : '#9ca3af';
        const text = on ? '#15803d' : '#6b7280';
        return `<span style="display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:9999px;background:${bg};font-size:11px;font-weight:500;color:${text};line-height:1">
          <span style="width:6px;height:6px;border-radius:50%;background:${dot};flex-shrink:0"></span>
          ${on ? 'Activo' : 'Inactivo'}
        </span>`;
      },
    };
  }

  getColumnaAcciones(): ColDef {
    return {
      colId: "acciones",
      headerName: "",
      cellRenderer: AccionButton,
      cellStyle: { display: 'flex', alignItems: 'center' },
      width: 100,
      minWidth: 100,
      maxWidth: 100,
      sortable: false,
      filter: false,
      resizable: false,
      suppressHeaderMenuButton: true
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
