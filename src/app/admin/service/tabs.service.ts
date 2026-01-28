import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TabsStateService {

  public tabActivo = signal<string>('0');
  public tabDeshabilitado = signal<boolean>(true);

  irATab(tab: string | number) {
    this.tabActivo.set(String(tab));
  }

  cambiarEstadoTab(estado: boolean) {
    this.tabDeshabilitado.set(estado);
  }

  reset() {
    this.tabActivo.set('0');
    this.tabDeshabilitado.set(false);
  }
}
