import { Page, expect } from '@playwright/test';
import { env } from '../../env';

export class VentaPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/ventas/ventas');
  }

  /** El módulo de ventas usa tabs del lado del cliente (misma URL), no rutas. */
  async irANuevaVenta() {
    await this.page.getByRole('tab', { name: 'Nuevo' }).click();
    await expect(this.page.locator('#productoSearch')).toBeVisible();
  }

  /** Agrega una unidad de `codigo` al carrito (llamar N veces para N unidades). */
  async agregarProducto(codigo: string = env.productoCodigo) {
    const buscador = this.page.locator('#productoSearch');
    await buscador.fill(codigo);
    await expect(this.page.getByText(codigo, { exact: false }).first()).toBeVisible();
    await buscador.press('Enter');
  }

  /**
   * Cobra la venta actual y devuelve el número mostrado en el diálogo "Venta registrada".
   * "Cobrado" completa la venta (dispara VentaCompletadaEvent: stock + facturación async).
   */
  async cobrarVenta(): Promise<string> {
    return this.registrarVenta('Cobrado', '✓ Cobrada');
  }

  /** Deja la venta actual en PENDIENTE (sin completar) y devuelve su número. */
  async dejarVentaPendiente(): Promise<string> {
    return this.registrarVenta('Pendiente', '⏳ Pendiente de cobro');
  }

  private async registrarVenta(boton: 'Cobrado' | 'Pendiente', textoEstadoEsperado: string): Promise<string> {
    await this.page.getByRole('button', { name: /Cobrar/ }).click();
    await this.page.getByRole('button', { name: boton }).click();

    await expect(this.page.getByText('¡Venta registrada!')).toBeVisible({ timeout: 15_000 });
    await expect(this.page.getByText(textoEstadoEsperado)).toBeVisible();

    const numeroTexto = await this.page.locator('p:has-text("N°")').innerText();
    const numero = numeroTexto.match(/N°\s*(\S+)/)?.[1];
    if (!numero) throw new Error(`No se pudo leer el número de venta del diálogo: "${numeroTexto}"`);

    await this.page.getByRole('button', { name: 'No, gracias' }).click();
    return numero;
  }
}
