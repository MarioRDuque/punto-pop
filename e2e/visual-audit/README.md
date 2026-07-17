# Auditoría visual (Playwright)

Crawler de screenshots — no es una suite de tests con assertions, complementa `e2e/tests/`
(los specs funcionales de PUN-33). Navega cada ruta de negocio en modo claro y oscuro,
captura un screenshot full-page de cada una, y registra errores de consola. La revisión de
los pares de screenshots es manual/asistida: se hace una vez, no corre en CI.

## Requisitos previos

Mismos que `e2e/README.md`: backend + frontend corriendo, backend con context Liquibase
`dev,e2e` activo (`SPRING_LIQUIBASE_CONTEXTS=dev,e2e`).

## Correr

```bash
npx playwright install --with-deps chromium   # una sola vez
E2E_BASE_URL=http://localhost:4500 npm run e2e:visual-audit
```

(ajustar `E2E_BASE_URL` al puerto real del `ng serve` local — el default del script npm
`start` de este repo es `4500`, no el `4200` que asume `e2e/env.ts`).

Salida: `e2e/visual-audit/screenshots/<módulo>/<ruta>-{light,dark}.png` +
`e2e/visual-audit/report.json` (errores de consola por ruta). Ambos están gitignoreados —
son artefactos de una corrida puntual, no se versionan.

## Gotcha: el tema no persiste entre rutas

`page.goto()` de Playwright hace un reload completo del navegador, no una navegación SPA
del Router de Angular — y `LayoutService` no persiste `darkTheme` en `localStorage` (ver
hallazgo PUN-42). Por eso el spec re-activa el toggle de tema **después** de cada
`page.goto`, no una sola vez al principio: la primera versión de este script togleaba una
vez antes del loop y todos los "dark" salían idénticos a los "light" porque cada navegación
reseteaba el signal a su default (`false`).

## Rutas cubiertas

Ver `routes.ts` — extraídas de los `*.routes.ts` reales de cada módulo al momento de
escribir esto (14/jul). Cubre las vistas de listado (grids); no cubre diálogos de
alta/edición (se abren client-side desde el grid, no son rutas propias) ni tabs internos
del panel de Perfil (preferencias, 2FA, historial de sesiones — todas viven bajo `/`, un
único componente con tabs, no rutas separadas).

## Hallazgos de la corrida inicial (PUN-39)

- El barrido de dark mode de PUN-8/21/22/23/24 se sostiene: 26 capturas (13 rutas × 2
  temas) revisadas manualmente, sin contraste roto ni colores hex fijos visibles en los
  grids de negocio.
- PUN-40 — label de PrimeNG `p-floatlabel` no despega del valor seleccionado en el filtro
  "Estado" de Reporte de Ventas (texto superpuesto). Reproduce en ambos temas, no es un bug
  de dark mode.
- PUN-41 — `/pages/documentation` sigue sirviendo el boilerplate de la plantilla Sakai sin
  adaptar (mismo patrón que PUN-32, fuera de su alcance original).
- PUN-42 — la preferencia de dark mode no persiste entre reloads (sin `localStorage`).
