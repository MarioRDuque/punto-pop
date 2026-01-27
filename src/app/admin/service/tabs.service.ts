import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TabsStateService {

  /** Tab activo actual */
  private readonly _tabActivo = signal<string>('0');
  public tabDeshabilitado = signal<boolean>(false);
  /** Solo lectura */
  readonly tabActivo = this._tabActivo.asReadonly();

  /** Cambiar de tab */
  irATab(tab: string | number) {
    this._tabActivo.set(String(tab));
  }

  cambiarEstado(estado: boolean) {
    this.tabDeshabilitado.set(estado);
  }

  /** Reset (opcional) */
  reset() {
    this._tabActivo.set('0');
    this.tabDeshabilitado.set(false);
  }
}
