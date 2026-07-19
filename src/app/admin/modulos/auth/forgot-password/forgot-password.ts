import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AppFloatingConfigurator } from '../../../component/floatingconfigurator/app.floatingconfigurator';
import { InputComponent } from '../../../component/input/input.component';
import { PasswordRecoveryService } from '../../../service/password-recovery.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    ButtonModule,
    ReactiveFormsModule,
    RouterModule,
    AppFloatingConfigurator,
    InputComponent,
  ],
  templateUrl: './forgot-password.html',
})
export class ForgotPassword {
  private readonly fb = inject(FormBuilder);
  private readonly passwordRecoveryService = inject(PasswordRecoveryService);
  private readonly destroyRef = inject(DestroyRef);

  readonly cargando = signal(false);
  readonly enviado = signal(false);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email } = this.form.getRawValue();
    this.cargando.set(true);

    this.passwordRecoveryService
      .solicitarRecuperacion({ email: email! })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.cargando.set(false);
          this.enviado.set(true);
        },
        error: () => {
          this.cargando.set(false);
        },
      });
  }
}
