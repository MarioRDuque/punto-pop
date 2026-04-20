import { Injectable, signal, Signal } from '@angular/core';

export type IdiomaDisponible = 'es' | 'en';

@Injectable({ providedIn: 'root' })
export class IdiomaService {

  private _idioma = signal<IdiomaDisponible>(
    (localStorage.getItem('idioma') as IdiomaDisponible) ?? 'es'
  );

  getIdioma(): Signal<IdiomaDisponible> {
    return this._idioma;
  }

  cambiarIdioma(idioma: IdiomaDisponible) {
    this._idioma.set(idioma);
    localStorage.setItem('idioma', idioma);
  }
}
