import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TabsStateService {

  /** Tab activo actual */
  private readonly _tabActivo = signal<string>('0');
  /** Solo lectura */
  readonly tabActivo = this._tabActivo.asReadonly();

  /** Cambiar de tab */
  irATab(tab: string | number) {
    this._tabActivo.set(String(tab));
  }

  /** Reset (opcional) */
  reset() {
    this._tabActivo.set('0');
  }
}
