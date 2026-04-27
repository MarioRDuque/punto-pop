import { Injectable } from '@angular/core';

interface CacheEntry<T> {
  value: T;
  expiraEn: number;
}

const TTL_DEFAULT_MS = 5 * 60 * 1000; // 5 minutos

@Injectable({ providedIn: 'root' })
export class CacheService {

  private readonly cache = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;
    if (Date.now() > entry.expiraEn) {
      this.cache.delete(key);
      return null;
    }
    return entry.value;
  }

  set<T>(key: string, value: T, ttlMs = TTL_DEFAULT_MS): void {
    this.cache.set(key, { value, expiraEn: Date.now() + ttlMs });
  }

  invalidar(key: string): void {
    this.cache.delete(key);
  }

  limpiar(): void {
    this.cache.clear();
  }
}
