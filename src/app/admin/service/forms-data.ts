import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FormsData <T> {
  private readonly _objetoSeleccionado = signal<T | null>(null);
  readonly objetoSeleccionado = this._objetoSeleccionado.asReadonly();

  seleccionarObjeto(objeto: T) {
    this._objetoSeleccionado.set(objeto);
  }
}
