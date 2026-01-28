import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FormsData <T> {
  private readonly _objetoSeleccionado = signal<T | null>(null);
  readonly objetoSeleccionado = this._objetoSeleccionado.asReadonly();
  public esFiltrar = signal<boolean>(false);

  seleccionarObjeto(objeto: T) {
    this._objetoSeleccionado.set(objeto);
  }

  cambiarEstado(estado: boolean) {
    this.esFiltrar.set(estado);
  }

  reset() {
    this.esFiltrar.set(false);
  }
}
