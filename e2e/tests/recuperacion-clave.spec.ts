import { test, expect } from '@playwright/test';
import { LoginPage } from '../support/pages/login-page';
import { PasswordRecoveryPage } from '../support/pages/password-recovery-page';
import { env } from '../env';

test.describe('Recuperación de contraseña', () => {
  test('el link "¿Olvidaste tu contraseña?" del login navega a /auth/forgot-password', async ({
    page,
  }) => {
    const login = new LoginPage(page);
    await login.goto();

    await page.getByRole('link', { name: '¿Olvidaste tu contraseña?' }).click();
    await expect(page).toHaveURL(/\/auth\/forgot-password/);
  });

  test('solicitar recuperación con el email sembrado muestra el mensaje genérico de confirmación', async ({
    page,
  }) => {
    const recovery = new PasswordRecoveryPage(page);
    await recovery.gotoForgotPassword();

    await recovery.solicitarRecuperacion(env.userEmail);

    // El backend responde 200 siempre, exista o no el email (evita user enumeration) —
    // por eso el mensaje es idéntico al de un email que no existe. Ver PUN-44.
    await recovery.esperarConfirmacionDeSolicitud();
  });

  test('/auth/reset-password sin token en la URL muestra "Link inválido"', async ({ page }) => {
    const recovery = new PasswordRecoveryPage(page);
    await recovery.gotoResetPassword();

    await recovery.esperarLinkInvalido();
  });

  test('confirmar la contraseña con un valor distinto muestra un toast sin llamar al backend', async ({
    page,
  }) => {
    const recovery = new PasswordRecoveryPage(page);
    // Un token con formato válido (UUID) pero inexistente alcanza para este caso: la
    // validación de "no coinciden" corta en el cliente, antes de llegar al backend.
    await recovery.gotoResetPassword('00000000-0000-0000-0000-000000000000');

    await recovery.completarNuevaContrasenia('NuevaClave123', 'OtraClave456');

    await expect(page.getByText('Las contraseñas no coinciden.')).toBeVisible({
      timeout: 5_000,
    });
  });

  test('un token inexistente o expirado devuelve el error del backend', async ({ page }) => {
    const recovery = new PasswordRecoveryPage(page);
    await recovery.gotoResetPassword('00000000-0000-0000-0000-000000000000');

    await recovery.completarNuevaContrasenia('NuevaClave123', 'NuevaClave123');

    // Mensaje textual de BusinessException en PasswordResetService (backend, PUN-44) via
    // el errorInterceptor genérico (case 400 -> toast con error.detail), sin código extra
    // en el componente.
    await expect(page.getByText('Token inválido o expirado.')).toBeVisible({ timeout: 10_000 });
  });

  // No hay test acá para "completar un reset con un token real y loguearse con la nueva
  // contraseña": requiere leer el token generado por /auth/forgot-password desde la base
  // de datos o un inbox de email real, y no hay infraestructura en el repo para
  // interceptar ninguno de los dos desde Playwright (mismo tipo de limitación que
  // nota-credito-debito.spec.ts y el sub-test de Payphone; ver e2e/README.md). Se probó
  // manualmente end-to-end contra el backend real durante el desarrollo de PUN-45.
});
