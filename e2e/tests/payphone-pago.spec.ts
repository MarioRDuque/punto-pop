import { test, expect } from '@playwright/test';
import { LoginPage } from '../support/pages/login-page';
import { VentaPage } from '../support/pages/venta-page';
import { ApiClient } from '../support/api-client';
import { env } from '../env';

test.describe('Pago vía Payphone', () => {
  test('una venta puede dejarse pendiente para pagar después', async ({ page }) => {
    const login = new LoginPage(page);
    const venta = new VentaPage(page);

    await login.goto();
    await login.loginComoUsuarioE2E();
    await venta.goto();
    await venta.irANuevaVenta();
    await venta.agregarProducto();

    const numero = await venta.dejarVentaPendiente();
    expect(numero).toBeTruthy();

    const api = await ApiClient.login();
    try {
      const ventaCreada = await api.getVentaByNumero(numero, 'PENDIENTE');
      expect(ventaCreada.estado).toBe('PENDIENTE');
    } finally {
      await api.dispose();
    }
  });

  /**
   * El flujo de pago Payphone no tiene UI en el frontend todavía — solo existe como
   * endpoints del backend (`pagos/pago/iniciar|confirmar`), ver PagoController. Se
   * ejerce por API en vez de por browser porque no hay nada que clickear. Requiere
   * PAYPHONE_TOKEN de sandbox; sin él el backend no puede autenticarse contra Payphone
   * y no hay forma de mockear esa llamada saliente sin infraestructura adicional (fuera
   * de alcance de PUN-33 — ver e2e/README.md para el detalle y una propuesta de follow-up).
   */
  test('iniciar un pago para una venta pendiente devuelve un link de Payphone', async ({ page }) => {
    test.skip(!env.payphoneSandboxEnabled, 'Requiere PAYPHONE_TOKEN de sandbox. Ver e2e/README.md.');

    const login = new LoginPage(page);
    const venta = new VentaPage(page);

    await login.goto();
    await login.loginComoUsuarioE2E();
    await venta.goto();
    await venta.irANuevaVenta();
    await venta.agregarProducto();
    const numero = await venta.dejarVentaPendiente();

    const api = await ApiClient.login();
    try {
      const ventaCreada = await api.getVentaByNumero(numero, 'PENDIENTE');
      const res = await api.iniciarPago(
        ventaCreada.id,
        'https://e2e.local/pago/retorno',
        'https://e2e.local/pago/cancelado',
      );
      expect(res.ok()).toBeTruthy();
      const body = await res.json();
      expect(body.paymentUrl).toMatch(/^https?:\/\//);
    } finally {
      await api.dispose();
    }
  });
});
