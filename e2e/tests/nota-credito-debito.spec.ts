import { test, expect } from '@playwright/test';
import { LoginPage } from '../support/pages/login-page';
import { VentaPage } from '../support/pages/venta-page';
import { ApiClient } from '../support/api-client';

/**
 * venta-detalle.ts gatea los botones "Nota de Crédito"/"Nota de Débito" con
 * `puedeEmitirNC = comprobante()?.estado === 'AUTORIZADO'` — solo aparecen si el SRI
 * autorizó el comprobante. Sin credenciales reales de SRI (SRI_RUC/SRI_P12_*) el
 * comprobante nunca llega a AUTORIZADO en este entorno (termina en ERROR, ver
 * FacturacionServiceImpl / PUN-13), así que la emisión de NC/ND por UI no es
 * ejercitable acá — se salta con un motivo explícito en vez de simular una aserción
 * que no prueba nada real. Queda lista para correr completa en un entorno con sandbox
 * SRI (o cuando exista infraestructura para mockear el WSDL) — ver e2e/README.md.
 */
test.describe('Nota de crédito/débito', () => {
  test('emitir nota de crédito sobre una venta facturada', async ({ page }) => {
    const login = new LoginPage(page);
    const venta = new VentaPage(page);

    await login.goto();
    await login.loginComoUsuarioE2E();
    await venta.goto();
    await venta.irANuevaVenta();
    await venta.agregarProducto();
    const numero = await venta.cobrarVenta();

    const api = await ApiClient.login();
    try {
      const ventaCreada = await api.getVentaByNumero(numero);
      await expect
        .poll(async () => (await api.getComprobante(ventaCreada.id)).estado, {
          message: 'Esperando que VentaFacturacionListener procese el comprobante',
          timeout: 15_000,
        })
        .not.toBe('PENDIENTE');
      const comprobante = await api.getComprobante(ventaCreada.id);

      test.skip(
        comprobante.estado !== 'AUTORIZADO',
        `Comprobante quedó en estado "${comprobante.estado}" (no AUTORIZADO) — requiere sandbox SRI real. Ver e2e/README.md.`,
      );

      await page.getByRole('tab', { name: 'Listado' }).click();
      await page.getByRole('cell', { name: numero }).click({ button: 'right' });
      await page.getByRole('menuitem', { name: /consultar/i }).click();

      await page.getByRole('button', { name: 'Nota de Crédito' }).click();
      const cantidad = page.locator('input[type="number"]').first();
      await cantidad.fill('1');
      await page.getByLabel(/motivo/i).fill('Devolución E2E Playwright');
      await page.getByRole('button', { name: /emitir/i }).click();
      await expect(page.getByText(/AUTORIZADO/i)).toBeVisible({ timeout: 15_000 });
    } finally {
      await api.dispose();
    }
  });
});
