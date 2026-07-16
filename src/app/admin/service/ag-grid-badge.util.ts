/**
 * Renderers de badge/avatar compartidos para columnas de AG-Grid.
 * Usan variables CSS de PrimeNG (`--p-*`) en vez de hex fijos para verse bien en dark mode.
 */

export type BadgeTone = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';

export interface EstadoBadgeConfig {
  tone: BadgeTone;
  label: string;
}

const AVATAR_PALETTE = [
  'var(--p-blue-500)',
  'var(--p-emerald-500)',
  'var(--p-orange-500)',
  'var(--p-violet-500)',
  'var(--p-cyan-500)',
  'var(--p-pink-500)',
  'var(--p-teal-500)',
  'var(--p-amber-600)',
  'var(--p-indigo-500)',
  'var(--p-green-500)',
  'var(--p-rose-500)',
  'var(--p-sky-600)',
];

function hashKey(key: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

export function getInitials(nombre: string): string {
  const parts = (nombre ?? '').trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (nombre ?? '??').substring(0, 2).toUpperCase();
}

export function getAvatarColor(key: string): string {
  return AVATAR_PALETTE[hashKey(key ?? '') % AVATAR_PALETTE.length];
}

export function renderAvatarBadge(key: string, label: string): string {
  const color = getAvatarColor(key);
  return `<div style="width:26px;height:26px;border-radius:6px;background:${color};display:flex;align-items:center;justify-content:center;color:#fff;font-size:9px;font-weight:700;flex-shrink:0">${label}</div>`;
}

export function renderStatusBadge(
  estado: string,
  config: Record<string, EstadoBadgeConfig>,
  opts: { dot?: boolean } = {},
): string {
  const s = config[estado] ?? { tone: 'secondary' as BadgeTone, label: estado };
  const bg = `var(--p-badge-${s.tone}-background)`;
  const color = `var(--p-badge-${s.tone}-color)`;
  if (opts.dot) {
    return `<span style="display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:9999px;background:${bg};font-size:11px;font-weight:500;color:${color};line-height:1">
      <span style="width:6px;height:6px;border-radius:50%;background:${color};flex-shrink:0"></span>
      ${s.label}
    </span>`;
  }
  return `<span style="font-size:10px;font-weight:600;padding:2px 8px;border-radius:9999px;background:${bg};color:${color}">${s.label}</span>`;
}
