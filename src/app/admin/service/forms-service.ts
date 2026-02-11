import { Injectable, signal } from '@angular/core';
import { AccionEnum } from '../enums/accion-enum';

@Injectable({
  providedIn: 'root',
})
export class FormsService <T> {

  public objetoSeleccionado = signal<T | null>(null);
  public accion = signal<AccionEnum>(AccionEnum.CREAR);

  seleccionarObjeto(objeto: T) {
    this.objetoSeleccionado.set(objeto);
  }

}
