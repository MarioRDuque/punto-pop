import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DosFAService } from '../../../../service/dos-fa.service';
import { ToastService } from '../../../../service/toast.service';
import { AuthService } from '../../../../service/auth.service';

/**
 * Componente de gestión de 2FA
 * Requisito 17.3: Activación/desactivación 2FA con QR
 */
@Component({
  selector: 'app-dos-fa-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule],
  template: `
    <div class="dos-fa-panel">
      @if (!tiene2FAActivo()) {
        <!-- Estado: 2FA Desactivado -->
        <div class="estado-2fa">
          <div class="flex items-center gap-2 mb-3">
            <i class="pi pi-shield text-gray-400 text-2xl"></i>
            <span class="font-semibold">2FA Desactivado</span>
          </div>
          <p class="text-sm text-gray-600 mb-4">
            La autenticación de dos factores añade una capa adicional de seguridad a tu cuenta.
          </p>
          
          @if (!mostrandoQR()) {
            <p-button
              label="Activar 2FA"
              icon="pi pi-lock"
              (onClick)="iniciarActivacion()"
              [loading]="cargandoQR()"
            />
          } @else {
            <!-- Mostrar QR y formulario de activación -->
            <div class="qr-container">
              <div class="qr-code-wrapper">
                @if (qrUrl()) {
                  <img [src]="qrUrl()" alt="Código QR 2FA" class="qr-image" />
                } @else {
                  <div class="qr-loading">
                    <i class="pi pi-spin pi-spinner text-4xl"></i>
                  </div>
                }
              </div>
              
              <div class="qr-instructions">
                <h4 class="font-semibold mb-2">Instrucciones:</h4>
                <ol class="text-sm text-gray-600 space-y-1">
                  <li>1. Descarga una app de autenticación (Google Authenticator, Authy, etc.)</li>
                  <li>2. Escanea el código QR con la app</li>
                  <li>3. Ingresa el código de 6 dígitos que aparece en la app</li>
                </ol>
                
                @if (secret()) {
                  <div class="secret-manual mt-3">
                    <p class="text-xs text-gray-500">Código manual (si no puedes escanear):</p>
                    <code class="text-xs bg-gray-100 px-2 py-1 rounded">{{ secret() }}</code>
                  </div>
                }
              </div>

              <div class="field mt-4">
                <label for="codigoActivacion">Código de Verificación</label>
                <input
                  pInputText
                  id="codigoActivacion"
                  [(ngModel)]="codigoActivacion"
                  placeholder="000000"
                  maxlength="6"
                  class="w-full"
                />
              </div>

              <div class="flex justify-end gap-2 mt-4">
                <p-button
                  label="Cancelar"
                  severity="secondary"
                  (onClick)="cancelarActivacion()"
                />
                <p-button
                  label="Activar"
                  [disabled]="codigoActivacion.length !== 6"
                  [loading]="activando()"
                  (onClick)="activar2FA()"
                />
              </div>
            </div>
          }
        </div>
      } @else {
        <!-- Estado: 2FA Activado -->
        <div class="estado-2fa">
          <div class="flex items-center gap-2 mb-3">
            <i class="pi pi-shield text-green-500 text-2xl"></i>
            <span class="font-semibold text-green-700">2FA Activado</span>
          </div>
          <p class="text-sm text-gray-600 mb-4">
            Tu cuenta está protegida con autenticación de dos factores.
          </p>

          @if (!mostrandoDesactivacion()) {
            <p-button
              label="Desactivar 2FA"
              severity="danger"
              icon="pi pi-unlock"
              (onClick)="iniciarDesactivacion()"
            />
          } @else {
            <!-- Formulario de desactivación -->
            <div class="desactivacion-form">
              <p class="text-sm text-gray-600 mb-3">
                Ingresa un código de verificación para desactivar 2FA:
              </p>
              
              <div class="field">
                <label for="codigoDesactivacion">Código de Verificación</label>
                <input
                  pInputText
                  id="codigoDesactivacion"
                  [(ngModel)]="codigoDesactivacion"
                  placeholder="000000"
                  maxlength="6"
                  class="w-full"
                />
              </div>

              <div class="flex justify-end gap-2 mt-4">
                <p-button
                  label="Cancelar"
                  severity="secondary"
                  (onClick)="cancelarDesactivacion()"
                />
                <p-button
                  label="Desactivar"
                  severity="danger"
                  [disabled]="codigoDesactivacion.length !== 6"
                  [loading]="desactivando()"
                  (onClick)="desactivar2FA()"
                />
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .dos-fa-panel {
      padding: 1rem 0;
    }

    .estado-2fa {
      display: flex;
      flex-direction: column;
    }

    .qr-container {
      margin-top: 1rem;
      padding: 1rem;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      background: #f9fafb;
    }

    .qr-code-wrapper {
      display: flex;
      justify-content: center;
      margin-bottom: 1rem;
    }

    .qr-image {
      width: 200px;
      height: 200px;
      border: 2px solid #e5e7eb;
      border-radius: 0.5rem;
      background: white;
    }

    .qr-loading {
      width: 200px;
      height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #e5e7eb;
      border-radius: 0.5rem;
      background: white;
    }

    .qr-instructions ol {
      list-style: none;
      padding-left: 0;
    }

    .secret-manual {
      padding: 0.75rem;
      background: white;
      border-radius: 0.375rem;
      border: 1px solid #e5e7eb;
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
export class DosFAPanel implements OnInit {
  private dosFAService = inject(DosFAService);
  private authService = inject(AuthService);
  private toast = inject(ToastService);

  tiene2FAActivo = signal<boolean>(false);
  mostrandoQR = signal<boolean>(false);
  mostrandoDesactivacion = signal<boolean>(false);
  
  qrUrl = signal<string>('');
  secret = signal<string>('');
  
  codigoActivacion = '';
  codigoDesactivacion = '';
  
  cargandoQR = signal<boolean>(false);
  activando = signal<boolean>(false);
  desactivando = signal<boolean>(false);

  ngOnInit() {
    // Obtener estado de 2FA del usuario actual
    const usuario = this.authService.usuario();
    this.tiene2FAActivo.set(usuario?.tiene2FA ?? false);
  }

  iniciarActivacion() {
    this.cargandoQR.set(true);
    this.dosFAService.generarQR().subscribe({
      next: (data) => {
        this.qrUrl.set(data.qrUrl);
        this.secret.set(data.secret);
        this.mostrandoQR.set(true);
        this.cargandoQR.set(false);
      },
      error: (error) => {
        this.toast.error(error.message || 'Error al generar código QR');
        this.cargandoQR.set(false);
      },
    });
  }

  activar2FA() {
    if (this.codigoActivacion.length !== 6) return;

    this.activando.set(true);
    this.dosFAService.activar2FA(this.codigoActivacion).subscribe({
      next: () => {
        this.toast.success('2FA activado exitosamente');
        this.tiene2FAActivo.set(true);
        this.cancelarActivacion();
        this.activando.set(false);
      },
      error: (error) => {
        this.toast.error(error.message || 'Código inválido. Intenta nuevamente.');
        this.activando.set(false);
      },
    });
  }

  cancelarActivacion() {
    this.mostrandoQR.set(false);
    this.qrUrl.set('');
    this.secret.set('');
    this.codigoActivacion = '';
  }

  iniciarDesactivacion() {
    this.mostrandoDesactivacion.set(true);
  }

  desactivar2FA() {
    if (this.codigoDesactivacion.length !== 6) return;

    this.desactivando.set(true);
    this.dosFAService.desactivar2FA(this.codigoDesactivacion).subscribe({
      next: () => {
        this.toast.success('2FA desactivado exitosamente');
        this.tiene2FAActivo.set(false);
        this.cancelarDesactivacion();
        this.desactivando.set(false);
      },
      error: (error) => {
        this.toast.error(error.message || 'Código inválido. Intenta nuevamente.');
        this.desactivando.set(false);
      },
    });
  }

  cancelarDesactivacion() {
    this.mostrandoDesactivacion.set(false);
    this.codigoDesactivacion = '';
  }
}
