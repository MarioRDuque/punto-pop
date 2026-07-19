import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AppFloatingConfigurator } from '../../../component/floatingconfigurator/app.floatingconfigurator';
import { PasswordComponent } from '../../../component/password/password';
import { PasswordRecoveryService } from '../../../service/password-recovery.service';
import { ToastService } from '../../../service/toast.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    ButtonModule,
    ReactiveFormsModule,
    RouterModule,
    AppFloatingConfigurator,
    PasswordComponent,
  ],
  templateUrl: './reset-password.html',
})
export class ResetPassword implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly passwordRecoveryService = inject(PasswordRecoveryService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly cargando = signal(false);
  readonly completado = signal(false);
  token = '';

  readonly form = this.fb.group({
    nuevaClave: ['', [Validators.required, Validators.minLength(8)]],
    confirmarClave: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
  }

  restablecer(): void {
    if (this.form.invalid || !this.token) {
      this.form.markAllAsTouched();
      return;
    }

    const { nuevaClave, confirmarClave } = this.form.getRawValue();
    if (nuevaClave !== confirmarClave) {
      this.toast.error('Las contraseñas no coinciden.', 'Error de Validación');
      return;
    }

    this.cargando.set(true);

    this.passwordRecoveryService
      .resetearContrasenia({ token: this.token, nuevaClave: nuevaClave! })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.cargando.set(false);
          this.completado.set(true);
        },
        error: () => {
          this.cargando.set(false);
        },
      });
  }
}
