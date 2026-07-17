import { test, expect } from '@playwright/test';
import { LoginPage } from '../support/pages/login-page';
import { VentaPage } from '../support/pages/venta-page';
import { ApiClient } from '../support/api-client';
import { env } from '../env';

test.describe('Flujo crítico: login → crear venta → completar → stock/comprobante', () => {
  test('cobrar una venta reduce el stock del producto y genera un comprobante', async ({ page }) => {
    const login = new LoginPage(page);
    const venta = new VentaPage(page);

    await login.goto();
    await login.loginComoUsuarioE2E();

    const api = await ApiClient.login();
    try {
      const stockAntes = (await api.getProducto(env.productoCodigo)).stock;

      await venta.goto();
      await venta.irANuevaVenta();
      await venta.agregarProducto();
      const numeroVenta = await venta.cobrarVenta();
      expect(numeroVenta).toBeTruthy();

      // El catálogo que alimenta el buscador de productos se carga una sola vez al entrar
      // al formulario (signal local, sin refetch), así que no refleja el stock recién
      // descontado dentro de la misma sesión de página — se verifica por API, que es la
      // fuente de verdad real de StockReductionListener.
      await expect
        .poll(async () => (await api.getProducto(env.productoCodigo)).stock, {
          message: 'Esperando que StockReductionListener descuente el stock',
          timeout: 15_000,
        })
        .toBe(stockAntes - 1);

      // El estado del comprobante SRI se ve en venta-detalle.html (p-tag "Comprobante SRI"),
      // pero llegar ahí requiere el menú contextual del grid — se verifica por API para no
      // acoplar el test a esa interacción. Sin credenciales reales de SRI en este entorno el
      // comprobante no llega a AUTORIZADO; lo que importa acá es que el listener async terminó
      // y dejó un estado terminal (nunca se queda en PENDIENTE indefinidamente).
      const ventaCreada = await api.getVentaByNumero(numeroVenta);
      await expect
        .poll(async () => (await api.getComprobante(ventaCreada.id)).estado, {
          message: 'Esperando que VentaFacturacionListener procese el comprobante',
          timeout: 15_000,
        })
        .not.toBe('PENDIENTE');
    } finally {
      await api.dispose();
    }
  });
});
