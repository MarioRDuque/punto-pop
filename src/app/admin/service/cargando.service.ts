import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CargandoService {

  loading = signal(false);

  activar() {
    this.loading.set(true);
  }

  inactivar() {
    this.loading.set(false);
  }

}
