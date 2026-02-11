import { Injectable, signal } from '@angular/core';
import { TabsEnum } from '../enums/tabs-enum';

@Injectable({ providedIn: 'root' })
export class TabsStateService {

  public tabActivo = signal<string>(TabsEnum.LISTADO);
  public tabDeshabilitado = signal<boolean>(true);

  irATab(tab: string | number) {
    this.tabActivo.set(String(tab));
  }

  cambiarEstadoTab(estado: boolean) {
    this.tabDeshabilitado.set(estado);
  }

  reset() {
    this.tabActivo.set(TabsEnum.LISTADO);
    this.tabDeshabilitado.set(false);
  }
}
