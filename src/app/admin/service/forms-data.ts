import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FormsData <T> {

  public objetoSeleccionado = signal<T | null>(null);
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
