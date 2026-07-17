import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env['E2E_BASE_URL'] ?? 'http://localhost:4200';

/**
 * Config dedicada al crawler de auditoría visual (PUN-39) — separada de
 * `playwright.config.ts` (que apunta a `e2e/tests`, los specs funcionales de PUN-33) para
 * que `npm run e2e` normal nunca la recoja por accidente.
 */
export default defineConfig({
  testDir: '.',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  timeout: 5 * 60_000,
  use: {
    baseURL,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
