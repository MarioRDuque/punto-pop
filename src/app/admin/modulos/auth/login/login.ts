import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
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
        PasswordComponent
    ],
    templateUrl: './login.html',
    styleUrl: './login.scss'
})
export class Login {

    private fb = inject(FormBuilder);
    private loginService = inject(LoginService);
    private router = inject(Router);

    ICONSCONSTANT = ICONSCONSTANT;
    cargandoLogin = false;
    anio = new Date().getFullYear();

    loginForm = this.fb.group({
        username: ['', [Validators.required]],
        password: ['', [Validators.required]]
    });

    iniciarSesion() {
        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            return;
        }

        const { username, password } = this.loginForm.getRawValue();
        this.cargandoLogin = true;

        this.loginService.login({ username: username!, password: password! }).subscribe({
            next: () => {
                this.cargandoLogin = false;
                this.router.navigate(['/']);
            },
            error: () => {
                this.cargandoLogin = false;
            }
        });
    }
}
