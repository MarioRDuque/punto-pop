import { APIRequestContext, request } from '@playwright/test';
import { env } from '../env';

/**
 * Cliente de API autenticado para aserciones que serían frágiles de verificar por UI
 * (p. ej. reducción de stock, estado del comprobante SRI). El flujo de negocio en sí
 * (login, crear venta, cobrar) se ejerce siempre por browser — este cliente solo lee
 * estado ya producido por esa interacción real.
 *
 * No se usa la opción `baseURL` de APIRequestContext: el resto de urls contra `apiURL`
 * (que ya incluye el context-path `/apipuntopop`) construyen la URL completa a mano,
 * porque la resolución de URLs de Playwright/WHATWG descarta ese context-path si el
 * path pasado a `.get()/.post()` empieza con "/".
 */
export class ApiClient {
  private constructor(
    private readonly ctx: APIRequestContext,
    private readonly token: string,
  ) {}

  static async login(): Promise<ApiClient> {
    const ctx = await request.newContext();
    const res = await ctx.post(`${env.apiURL}/auth/login`, {
      data: { email: env.userEmail, password: env.userPassword },
    });
    if (!res.ok()) {
      throw new Error(
        `No se pudo autenticar el usuario E2E (${env.userEmail}) contra ${env.apiURL}/auth/login: ` +
          `${res.status()} ${await res.text()}. ` +
          'Verificá que el backend haya arrancado con el context Liquibase "e2e" activo (ver e2e/README.md).',
      );
    }
    const body = await res.json();
    return new ApiClient(ctx, body.token as string);
  }

  async getProducto(codigo: string) {
    const res = await this.ctx.get(`${env.apiURL}/catalogo/producto/${codigo}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    if (!res.ok()) throw new Error(`GET producto ${codigo} falló: ${res.status()}`);
    return res.json();
  }

  async getVentaByNumero(numero: string, estado: 'PENDIENTE' | 'COMPLETADA' = 'COMPLETADA') {
    // No se usa el parámetro `q` acá: VentaServiceImpl.filtrar hace un inner join contra
    // cliente para el OR de búsqueda (root.join("cliente")), así que cualquier venta sin
    // cliente asignado (consumidor final, el caso por defecto acá) queda excluida del
    // resultado aunque su número matchee. Filtramos por estado y paginamos client-side
    // en su lugar; esto es un bug real del backend, no de este test — ver PR de PUN-33.
    const res = await this.ctx.get(
      `${env.apiURL}/ventas/venta/filtrar?estado=${estado}&size=50`,
      { headers: { Authorization: `Bearer ${this.token}` } },
    );
    if (!res.ok()) throw new Error(`GET ventas/filtrar falló: ${res.status()}`);
    const page = await res.json();
    const venta = page.content?.find((v: { numero: string }) => v.numero === numero);
    if (!venta) throw new Error(`No se encontró la venta con número "${numero}" en /ventas/venta/filtrar`);
    return venta;
  }

  async getComprobante(ventaId: string) {
    const res = await this.ctx.get(`${env.apiURL}/facturacion/comprobante/${ventaId}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    if (!res.ok()) throw new Error(`GET comprobante de venta ${ventaId} falló: ${res.status()}`);
    return res.json();
  }

  async iniciarPago(ventaId: string, returnUrl: string, cancelUrl: string) {
    return this.ctx.post(`${env.apiURL}/pagos/pago/iniciar`, {
      headers: { Authorization: `Bearer ${this.token}` },
      data: { ventaId, returnUrl, cancelUrl },
    });
  }

  async dispose() {
    await this.ctx.dispose();
  }
}
