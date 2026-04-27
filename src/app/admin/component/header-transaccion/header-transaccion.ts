import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { PanelModule } from 'primeng/panel';
import { ICONSCONSTANT } from '../../constantes/icons-constants';

export type ModoTransaccion = 'nuevo' | 'ver' | 'editar' | 'anular' | 'autorizar';

/**
 * Header genérico para formularios transaccionales (ventas, compras, etc.).
 *
 * Modos:
 *  - nuevo     → [Cancelar] [Guardar]
 *  - editar    → [Cancelar] [Guardar cambios]
 *  - anular    → [Cancelar] [Confirmar anulación]
 *  - autorizar → [Cancelar] [Rechazar] [Autorizar]
 *  - ver       → botones opcionales según flags + [Regresar]
 *               (export/imprimir solo en este modo)
 */
@Component({
  selector: 'app-header-transaccion',
  standalone: true,
  imports: [ButtonModule, TooltipModule, PanelModule],
  templateUrl: './header-transaccion.html',
  styleUrl: './header-transaccion.scss',
})
export class HeaderTransaccion {

  readonly ICONS = ICONSCONSTANT;

  @Input({ required: true }) titulo!: string;
  @Input() subtitulo?: string;
  @Input() modo: ModoTransaccion = 'nuevo';

  // ─── Labels personalizables ──────────────────────────────────────────────
  @Input() labelGuardar   = 'Guardar';
  @Input() labelAnular    = 'Anular';
  @Input() labelModificar = 'Modificar';
  @Input() labelAutorizar = 'Autorizar';
  @Input() labelRechazar  = 'Rechazar';

  // ─── Botones disponibles en modo 'ver' ───────────────────────────────────
  @Input() mostrarModificar = false;
  @Input() mostrarAnular    = false;
  @Input() mostrarAutorizar = false;
  @Input() mostrarEliminar  = false;
  @Input() mostrarExportar  = false;
  @Input() mostrarImprimir  = false;

  // ─── Estado de carga (deshabilita botones de acción) ────────────────────
  @Input() cargando = false;

  // ─── Eventos ─────────────────────────────────────────────────────────────
  @Output() guardar   = new EventEmitter<void>();
  @Output() cancelar  = new EventEmitter<void>();
  @Output() modificar = new EventEmitter<void>();
  @Output() anular    = new EventEmitter<void>();
  @Output() autorizar = new EventEmitter<void>();
  @Output() rechazar  = new EventEmitter<void>();
  @Output() eliminar  = new EventEmitter<void>();
  @Output() exportar  = new EventEmitter<void>();
  @Output() imprimir  = new EventEmitter<void>();
  @Output() regresar  = new EventEmitter<void>();

  get esEdicion(): boolean {
    return this.modo === 'nuevo' || this.modo === 'editar';
  }
}
