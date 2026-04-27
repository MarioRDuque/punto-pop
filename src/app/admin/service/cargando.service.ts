import { Injectable, signal } from '@angular/core';

const TIMEOUT_MS = 30_000;

@Injectable({ providedIn: 'root' })
export class CargandoService {

  readonly loading = signal(false);

  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  activar(): void {
    this.loading.set(true);
    this.timeoutId = setTimeout(() => this.inactivar(), TIMEOUT_MS);
  }

  inactivar(): void {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.loading.set(false);
  }
}
