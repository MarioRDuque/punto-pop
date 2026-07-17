import { Page, expect } from '@playwright/test';
import { env } from '../../env';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/auth/login');
  }

  async loginComoUsuarioE2E() {
    const email = this.page.locator('input#email');
    const password = this.page.locator('input[type="password"]');
    const submit = this.page.getByRole('button', { name: 'Iniciar sesión' });

    // Los inputs son wrappers custom (<app-input>/<app-password>) que resuelven su
    // FormControl vía ControlContainer al inicializarse; un `fill()` disparado antes de
    // que esa suscripción esté lista puede quedar solo en el DOM sin llegar al
    // FormGroup, dejando el submit como no-op silencioso. `pressSequentially` + blur
    // evita esa carrera al forzar los mismos eventos de teclado que un usuario real.
    await email.click();
    await email.pressSequentially(env.userEmail);
    await password.click();
    await password.pressSequentially(env.userPassword);
    await submit.click();

    await expect(this.page).not.toHaveURL(/\/auth\/login/, { timeout: 10_000 });
  }
}
