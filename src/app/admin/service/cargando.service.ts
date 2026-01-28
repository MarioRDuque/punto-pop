import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CargandoService {

  private _loading = new BehaviorSubject<boolean>(false);
  loading$ = this._loading.asObservable();

  activar() {
    this._loading.next(true);
  }

  inactivar() {
    this._loading.next(false);
  }

}
