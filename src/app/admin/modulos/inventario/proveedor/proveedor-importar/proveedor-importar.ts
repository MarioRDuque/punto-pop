import { Component, computed, inject, signal } from '@angular/core';
import { read, utils } from 'xlsx';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressBarModule } from 'primeng/progressbar';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { CommonModule } from '@angular/common';
import { ProveedorService } from '../proveedor.service';
import { ToastService } from '../../../../service/toast.service';
import { Proveedor } from '../../../../entities/Proveedor';

interface FilaImport {
  _idx: number;
  ruc: string;
  razonSocial: string;
  nombreComercial: string;
  direccion: string;
  telefono: string;
  email: string;
  errores: string[];
  estado: 'pendiente' | 'ok' | 'error';
}

@Component({
  selector: 'app-proveedor-importar',
  standalone: true,
  imports: [CommonModule, ButtonModule, TableModule, TooltipModule, ProgressBarModule],
  templateUrl: './proveedor-importar.html',
})
export class ProveedorImportar {
  private svc = inject(ProveedorService);
  private toast = inject(ToastService);
  ref = inject(DynamicDialogRef);

  readonly paso = signal<'upload' | 'preview' | 'resultado'>('upload');
  readonly fileName = signal('');
  readonly filas = signal<FilaImport[]>([]);
  readonly importando = signal(false);
  readonly progreso = signal(0);
  readonly sobre = signal(false);

  readonly validas = computed(() => this.filas().filter(f => !f.errores.length));
  readonly conError = computed(() => this.filas().filter(f => f.errores.length));
  readonly importadas = computed(() => this.filas().filter(f => f.estado === 'ok').length);
  readonly fallidas = computed(() => this.filas().filter(f => f.estado === 'error').length);

  onDragOver(e: DragEvent)  { e.preventDefault(); this.sobre.set(true); }
  onDragLeave()             { this.sobre.set(false); }
  onDrop(e: DragEvent)      { e.preventDefault(); this.sobre.set(false); const f = e.dataTransfer?.files[0]; if (f) this.leer(f); }
  onFile(e: Event)          { const f = (e.target as HTMLInputElement).files?.[0]; if (f) this.leer(f); }

  leer(file: File) {
    this.fileName.set(file.name);
    const reader = new FileReader();
    reader.onload = ev => {
      const wb = read(ev.target!.result, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows: string[][] = utils.sheet_to_json(ws, { header: 1, defval: '' });
      this.parsear(rows);
    };
    reader.readAsArrayBuffer(file);
  }

  parsear(rows: string[][]) {
    if (rows.length < 2) return;
    const h = rows[0].map(c => String(c).toLowerCase().trim().replace(/[áéíóúü ]/g, m =>
      ({ á:'a',é:'e',í:'i',ó:'o',ú:'u',ü:'u',' ':''}[m] ?? m)));
    const col = (keys: string[]) => keys.reduce((f, k) => f >= 0 ? f : h.findIndex(x => x === k || x.includes(k)), -1);

    const iRuc           = col(['ruc']);
    const iRazonSocial   = col(['razonsocial','razon_social','razónsocial','razón_social','nombre','empresa']);
    const iNombreCom     = col(['nombrecomercial','nombre_comercial','comercial']);
    const iDireccion     = col(['direccion','address','dirección']);
    const iTelefono      = col(['telefono','phone','tel','teléfono']);
    const iEmail         = col(['email','correo','mail']);

    const filas: FilaImport[] = rows.slice(1)
      .filter(r => r.some(c => String(c).trim()))
      .map((r, i) => {
        const f: FilaImport = {
          _idx: i + 2,
          ruc: String(r[iRuc] ?? '').trim(),
          razonSocial: String(r[iRazonSocial] ?? '').trim(),
          nombreComercial: String(r[iNombreCom] ?? '').trim(),
          direccion: String(r[iDireccion] ?? '').trim(),
          telefono: String(r[iTelefono] ?? '').trim(),
          email: String(r[iEmail] ?? '').trim(),
          errores: [],
          estado: 'pendiente',
        };
        if (!f.ruc) f.errores.push('RUC requerido');
        if (!f.razonSocial) f.errores.push('Razón social requerida');
        if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) f.errores.push('Email inválido');
        return f;
      });

    this.filas.set(filas);
    this.paso.set('preview');
  }

  descargarPlantilla() {
    const csv = [
      'ruc,razonSocial,nombreComercial,direccion,telefono,email',
      '1234567890001,Empresa SA,Nombre Comercial,Av. Principal 123,0999999999,empresa@email.com',
    ].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    a.download = 'plantilla_proveedores.csv';
    a.click();
  }

  volver() { this.paso.set('upload'); this.filas.set([]); this.fileName.set(''); }

  async importar() {
    this.importando.set(true);
    this.progreso.set(0);
    const lista = this.validas();

    for (let i = 0; i < lista.length; i++) {
      const f = lista[i];
      const proveedor: Proveedor = {
        ruc: f.ruc,
        razonSocial: f.razonSocial,
        nombreComercial: f.nombreComercial || undefined,
        direccion: f.direccion || undefined,
        telefono: f.telefono || undefined,
        email: f.email || undefined,
        estado: true,
      };
      try {
        const guardado = await this.svc.guardar(proveedor).toPromise();
        if (guardado) this.svc.agregarAlGrid(guardado);
        this.marcar(f._idx, 'ok');
      } catch {
        this.marcar(f._idx, 'error');
      }
      this.progreso.set(Math.round(((i + 1) / lista.length) * 100));
    }

    this.importando.set(false);
    const ok = this.importadas();
    if (ok > 0) this.toast.success(`${ok} proveedor${ok !== 1 ? 'es' : ''} importado${ok !== 1 ? 's' : ''}.`);
    this.paso.set('resultado');
  }

  private marcar(idx: number, estado: 'ok' | 'error') {
    this.filas.update(fs => fs.map(f => f._idx === idx ? { ...f, estado } : f));
  }

  cerrar() { this.ref.close(); }
}
