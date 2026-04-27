import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { AppFloatingConfigurator } from '../../../component/floatingconfigurator/app.floatingconfigurator';
import { LoginService } from '../../../service/login.service';
import { InputComponent } from '../../../component/input/input.component';
import { PasswordComponent } from '../../../component/password/password';
import { ICONSCONSTANT } from '../../../constantes/icons-constants';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ButtonModule,
    ReactiveFormsModule,
    RouterModule,
    RippleModule,
    AppFloatingConfigurator,
    InputComponent,
    PasswordComponent,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {

  private readonly fb = inject(FormBuilder);
  private readonly loginService = inject(LoginService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly ICONSCONSTANT = ICONSCONSTANT;
  readonly cargandoLogin = signal(false);
  readonly anio = new Date().getFullYear();

  readonly loginForm = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  iniciarSesion(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { username, password } = this.loginForm.getRawValue();
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/';

    this.cargandoLogin.set(true);

    this.loginService
      .login({ username: username!, password: password! })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.cargandoLogin.set(false);
          this.router.navigateByUrl(returnUrl);
        },
        error: () => {
          this.cargandoLogin.set(false);
        },
      });
  }
}
