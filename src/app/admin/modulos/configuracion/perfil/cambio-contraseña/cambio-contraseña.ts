import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { PerfilService } from '../perfil.service';
import { ToastService } from '../../../../service/toast.service';

/**
 * Componente de Cambio de Contraseña
 * Requisito 17.2: Cambio de contraseña con validación
 */
@Component({
  selector: 'app-cambio-password',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, PasswordModule],
  template: `
    <div class="password-change-form">
      <div class="field">
        <label for="passwordActual">Contraseña Actual</label>
        <p-password
          id="passwordActual"
          [(ngModel)]="passwordActual"
          [feedback]="false"
          [toggleMask]="true"
          styleClass="w-full"
          inputStyleClass="w-full"
          placeholder="Ingrese su contraseña actual"
        />
      </div>

      <div class="field">
        <label for="passwordNueva">Nueva Contraseña</label>
        <p-password
          id="passwordNueva"
          [(ngModel)]="passwordNueva"
          [feedback]="true"
          [toggleMask]="true"
          styleClass="w-full"
          inputStyleClass="w-full"
          placeholder="Mínimo 8 caracteres"
          (ngModelChange)="validarPassword()"
        />
        @if (mensajeValidacion()) {
          <small class="text-red-500">{{ mensajeValidacion() }}</small>
        }
      </div>

      <div class="field">
        <label for="confirmacion">Confirmar Nueva Contraseña</label>
        <p-password
          id="confirmacion"
          [(ngModel)]="confirmacion"
          [feedback]="false"
          [toggleMask]="true"
          styleClass="w-full"
          inputStyleClass="w-full"
          placeholder="Repita la nueva contraseña"
          (ngModelChange)="validarConfirmacion()"
        />
        @if (mensajeConfirmacion()) {
          <small class="text-red-500">{{ mensajeConfirmacion() }}</small>
        }
      </div>

      <div class="flex justify-end gap-2 mt-4">
        <p-button
          label="Cancelar"
          severity="secondary"
          (onClick)="limpiar()"
        />
        <p-button
          label="Cambiar Contraseña"
          [disabled]="!formularioValido()"
          [loading]="guardando()"
          (onClick)="cambiarPassword()"
        />
      </div>
    </div>
  `,
  styles: [`
    .password-change-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    label {
      font-weight: 600;
      font-size: 0.875rem;
    }
  `]
})
export class CambioPassword {
  private perfilService = inject(PerfilService);
  private toast = inject(ToastService);

  passwordActual = '';
  passwordNueva = '';
  confirmacion = '';

  mensajeValidacion = signal<string>('');
  mensajeConfirmacion = signal<string>('');
  guardando = signal<boolean>(false);

  validarPassword() {
    if (!this.passwordNueva) {
      this.mensajeValidacion.set('');
      return;
    }

    if (!this.perfilService.validarContraseña(this.passwordNueva)) {
      this.mensajeValidacion.set(
        'La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un carácter especial'
      );
    } else {
      this.mensajeValidacion.set('');
    }

    this.validarConfirmacion();
  }

  validarConfirmacion() {
    if (!this.confirmacion) {
      this.mensajeConfirmacion.set('');
      return;
    }

    if (this.passwordNueva !== this.confirmacion) {
      this.mensajeConfirmacion.set('Las contraseñas no coinciden');
    } else {
      this.mensajeConfirmacion.set('');
    }
  }

  formularioValido(): boolean {
    return (
      this.passwordActual.length > 0 &&
      this.passwordNueva.length > 0 &&
      this.confirmacion.length > 0 &&
      !this.mensajeValidacion() &&
      !this.mensajeConfirmacion()
    );
  }

  cambiarPassword() {
    if (!this.formularioValido()) return;

    this.guardando.set(true);
    this.perfilService
      .cambiarContraseña({
        contraseñaActual: this.passwordActual,
        contraseñaNueva: this.passwordNueva,
        confirmacion: this.confirmacion,
      })
      .subscribe({
        next: () => {
          this.toast.success('Contraseña cambiada exitosamente');
          this.limpiar();
          this.guardando.set(false);
        },
        error: (error) => {
          this.toast.error(error.message || 'Error al cambiar la contraseña');
          this.guardando.set(false);
        },
      });
  }

  limpiar() {
    this.passwordActual = '';
    this.passwordNueva = '';
    this.confirmacion = '';
    this.mensajeValidacion.set('');
    this.mensajeConfirmacion.set('');
  }
}
