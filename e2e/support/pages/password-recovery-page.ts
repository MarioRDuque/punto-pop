import { Page, expect } from '@playwright/test';

export class PasswordRecoveryPage {
  constructor(private readonly page: Page) {}

  async gotoForgotPassword() {
    await this.page.goto('/auth/forgot-password');
  }

  async gotoResetPassword(token?: string) {
    await this.page.goto(token ? `/auth/reset-password?token=${token}` : '/auth/reset-password');
  }

  /** Ver nota en LoginPage.loginComoUsuarioE2E: pressSequentially evita la carrera con el
   * ControlContainer del wrapper custom (<app-input>/<app-password>). */
  async solicitarRecuperacion(email: string) {
    const emailInput = this.page.locator('input#email');
    await emailInput.click();
    await emailInput.pressSequentially(email);
    await this.page.getByRole('button', { name: 'Enviar link' }).click();
  }

  async completarNuevaContrasenia(nuevaClave: string, confirmarClave: string) {
    const nueva = this.page.locator('#nuevaClave input');
    const confirmar = this.page.locator('#confirmarClave input');

    await nueva.click();
    await nueva.pressSequentially(nuevaClave);
    await confirmar.click();
    await confirmar.pressSequentially(confirmarClave);
    await this.page.getByRole('button', { name: 'Restablecer contraseña' }).click();
  }

  async esperarConfirmacionDeSolicitud() {
    await expect(this.page.getByText('Revisá tu email')).toBeVisible({ timeout: 10_000 });
  }

  async esperarLinkInvalido() {
    await expect(this.page.getByText('Link inválido')).toBeVisible({ timeout: 10_000 });
  }

  async esperarContraseniaActualizada() {
    await expect(this.page.getByText('Contraseña actualizada')).toBeVisible({ timeout: 10_000 });
  }
}
