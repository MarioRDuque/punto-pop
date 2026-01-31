import { Injectable, signal } from '@angular/core';
import { AccionEnum } from '../enums/accion-enum';

@Injectable({
  providedIn: 'root',
})
export class FormsService <T> {

  public objetoSeleccionado = signal<T | null>(null);
  public accion = signal<AccionEnum>(AccionEnum.CREAR);
  public esFiltrar = signal<boolean>(false);

  seleccionarObjeto(objeto: T) {
    this.objetoSeleccionado.set(objeto);
  }

  cambiarEstado(estado: boolean) {
    this.esFiltrar.set(estado);
  }

  reset() {
    this.esFiltrar.set(false);
  }
}
