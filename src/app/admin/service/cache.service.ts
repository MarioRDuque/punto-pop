import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CacheService {

  private cache = new Map<string, any>();

  get<T>(key: string): T | null {
    return this.cache.has(key) ? this.cache.get(key) : null;
  }

  set(key: string, value: any) {
    this.cache.set(key, value);
  }

  invalidar(key: string) {
    this.cache.delete(key);
  }

  limpiar() {
    this.cache.clear();
  }
}
