import { Component, computed, inject, signal } from '@angular/core';
import { read, utils } from 'xlsx';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressBarModule } from 'primeng/progressbar';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { CommonModule } from '@angular/common';
import { ProductoService } from '../producto.service';
import { ToastService } from '../../../../service/toast.service';
import { CatProducto } from '../../../../entities/CatProducto';

interface FilaImport {
  _idx: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  precioVenta: string;
  costo: string;
  stock: string;
  stockMinimo: string;
  categoriaId: string;
  unidadMedidaId: string;
  tarifaIvaId: string;
  errores: string[];
  estado: 'pendiente' | 'ok' | 'error';
}

@Component({
  selector: 'app-producto-importar',
  standalone: true,
  imports: [CommonModule, ButtonModule, TableModule, TooltipModule, ProgressBarModule],
  templateUrl: './producto-importar.html',
})
export class ProductoImportar {
  private svc = inject(ProductoService);
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

    const iCodigo       = col(['codigo','code','código']);
    const iNombre       = col(['nombre','name','producto']);
    const iDesc         = col(['descripcion','description','descripción']);
    const iPrecio       = col(['precioventa','precio','price','precio_venta']);
    const iCosto        = col(['costo','cost']);
    const iStock        = col(['stock']);
    const iStockMin     = col(['stockminimo','stock_minimo','stockmin']);
    const iCatId        = col(['categoriaid','categoria_id','categoría','categoria']);
    const iUMedidaId    = col(['unidadmedidaid','unidad_medida_id','unidadmedida','unidad']);
    const iIvaId        = col(['tarifaivaid','tarifa_iva_id','iva','tarifaiva']);

    const filas: FilaImport[] = rows.slice(1)
      .filter(r => r.some(c => String(c).trim()))
      .map((r, i) => {
        const f: FilaImport = {
          _idx: i + 2,
          codigo: String(r[iCodigo] ?? '').trim(),
          nombre: String(r[iNombre] ?? '').trim(),
          descripcion: String(r[iDesc] ?? '').trim(),
          precioVenta: String(r[iPrecio] ?? '').trim(),
          costo: String(r[iCosto] ?? '').trim(),
          stock: String(r[iStock] ?? '').trim(),
          stockMinimo: String(r[iStockMin] ?? '').trim(),
          categoriaId: String(r[iCatId] ?? '').trim(),
          unidadMedidaId: String(r[iUMedidaId] ?? '').trim(),
          tarifaIvaId: String(r[iIvaId] ?? '').trim(),
          errores: [],
          estado: 'pendiente',
        };
        if (!f.codigo) f.errores.push('Código requerido');
        if (!f.nombre) f.errores.push('Nombre requerido');
        if (!f.precioVenta || isNaN(Number(f.precioVenta))) f.errores.push('Precio venta inválido');
        if (!f.stock || isNaN(Number(f.stock))) f.errores.push('Stock inválido');
        if (!f.stockMinimo || isNaN(Number(f.stockMinimo))) f.errores.push('Stock mínimo inválido');
        if (!f.categoriaId) f.errores.push('Categoría requerida');
        if (!f.unidadMedidaId) f.errores.push('Unidad medida requerida');
        if (!f.tarifaIvaId) f.errores.push('Tarifa IVA requerida');
        return f;
      });

    this.filas.set(filas);
    this.paso.set('preview');
  }

  descargarPlantilla() {
    const csv = [
      'codigo,nombre,descripcion,precioVenta,costo,stock,stockMinimo,categoriaId,unidadMedidaId,tarifaIvaId',
      'P001,Producto ejemplo,Descripción,10.50,5.00,100,10,cat-uuid,und-uuid,iva-uuid',
    ].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    a.download = 'plantilla_productos.csv';
    a.click();
  }

  volver() { this.paso.set('upload'); this.filas.set([]); this.fileName.set(''); }

  async importar() {
    this.importando.set(true);
    this.progreso.set(0);
    const lista = this.validas();

    for (let i = 0; i < lista.length; i++) {
      const f = lista[i];
      const producto: CatProducto = {
        codigo: f.codigo,
        nombre: f.nombre,
        descripcion: f.descripcion || undefined,
        precioVenta: Number(f.precioVenta),
        costo: f.costo ? Number(f.costo) : undefined,
        stock: Number(f.stock),
        stockMinimo: Number(f.stockMinimo),
        estado: true,
        categoriaId: f.categoriaId,
        unidadMedidaId: f.unidadMedidaId,
        tarifaIvaId: f.tarifaIvaId,
      };
      try {
        const guardado = await this.svc.guardar(producto).toPromise();
        if (guardado) this.svc.agregarAlGrid(guardado);
        this.marcar(f._idx, 'ok');
      } catch {
        this.marcar(f._idx, 'error');
      }
      this.progreso.set(Math.round(((i + 1) / lista.length) * 100));
    }

    this.importando.set(false);
    const ok = this.importadas();
    if (ok > 0) this.toast.success(`${ok} producto${ok !== 1 ? 's' : ''} importado${ok !== 1 ? 's' : ''}.`);
    this.paso.set('resultado');
  }

  private marcar(idx: number, estado: 'ok' | 'error') {
    this.filas.update(fs => fs.map(f => f._idx === idx ? { ...f, estado } : f));
  }

  cerrar() { this.ref.close(); }
}
