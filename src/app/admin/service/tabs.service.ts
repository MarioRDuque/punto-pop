import { inject, Injectable, signal } from '@angular/core';
import { TabsEnum } from '../enums/tabs-enum';
import { AccionEnum } from '../enums/accion-enum';
import { FormsService } from './forms-service';

@Injectable({ providedIn: 'root' })
export class TabsStateService {

  public tabActivo = signal<string>(TabsEnum.LISTADO);
  public tabDeshabilitado = signal<boolean>(true);

  private formsService = inject(FormsService);

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

  onTabChange(value: string | number | undefined) {
    this.irATab(value ?? TabsEnum.LISTADO);
    if (value == TabsEnum.CREAR) {
      this.formsService.accion.set(AccionEnum.CREAR);
    }
    this.cambiarEstadoTab(true);
  }

  onInit(): void {
    if (this.tabActivo() === TabsEnum.EDITAR) {
      this.onTabChange(TabsEnum.LISTADO);
    }
  }
}
