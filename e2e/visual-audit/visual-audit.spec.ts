import { test } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { LoginPage } from '../support/pages/login-page';
import { auditRoutes } from './routes';

/**
 * Crawler de auditoría visual (PUN-39) — no es una suite de assertions. Navega cada ruta
 * de negocio en modo claro y oscuro, captura un screenshot full-page de cada una, y
 * registra errores de consola por ruta. La revisión de los pares de screenshots (buscando
 * contraste roto, colores hex fijos, layout cortado) es manual/asistida — ver README.
 */

const screenshotsDir = path.join(process.cwd(), 'e2e/visual-audit/screenshots');
const reportPath = path.join(process.cwd(), 'e2e/visual-audit/report.json');

interface RouteReport {
  module: string;
  name: string;
  path: string;
  consoleErrors: { theme: 'light' | 'dark'; text: string }[];
}

test('recorrer rutas de negocio y capturar screenshots claro/oscuro', async ({ page }) => {
  test.setTimeout(5 * 60_000);

  const report: RouteReport[] = auditRoutes.map((r) => ({ ...r, consoleErrors: [] }));
  let currentTheme: 'light' | 'dark' = 'light';

  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const entry = report.find((r) => r.path === new URL(page.url()).pathname);
    entry?.consoleErrors.push({ theme: currentTheme, text: msg.text() });
  });
  page.on('pageerror', (err) => {
    const entry = report.find((r) => r.path === new URL(page.url()).pathname);
    entry?.consoleErrors.push({ theme: currentTheme, text: err.message });
  });

  await test.step('login', async () => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginComoUsuarioE2E();
  });

  for (const theme of ['light', 'dark'] as const) {
    currentTheme = theme;

    for (const route of auditRoutes) {
      await test.step(`${route.module}/${route.name} — ${theme}`, async () => {
        // `page.goto` es un reload completo del navegador, no navegación SPA — el signal
        // de tema en LayoutService no persiste en localStorage, así que hay que
        // re-activar el toggle en cada ruta durante el pase oscuro (ver hallazgo en README:
        // el tema no sobrevive un refresh real, es un bug de producto aparte).
        await page.goto(route.path);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(200); // animaciones de entrada (fade-up, etc.)

        if (theme === 'dark') {
          await page.getByTitle('Modo oscuro').click();
          await page.waitForTimeout(500); // transición de tema (view-transition API)
        }

        const dir = path.join(screenshotsDir, route.module);
        fs.mkdirSync(dir, { recursive: true });
        await page.screenshot({
          path: path.join(dir, `${route.name}-${theme}.png`),
          fullPage: true,
        });
      });
    }
  }

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
});
