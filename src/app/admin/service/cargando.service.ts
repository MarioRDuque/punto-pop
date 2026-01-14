import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CargandoService {
  // BehaviorSubject con valor inicial false (no cargando)
  private _loading = new BehaviorSubject<boolean>(false);

  // Observable público para que otros se suscriban
  loading$ = this._loading.asObservable();

  activar() {
    this._loading.next(true);
  }

  inactivar() {
    this._loading.next(false);
  }

}
