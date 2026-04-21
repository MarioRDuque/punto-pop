import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { PerfilService } from '../perfil.service';
import { ToastService } from '../../../../service/toast.service';

/**
 * Componente de Preferencias de Notificación
 * Requisito 17.4: Preferencias de notificación
 */
@Component({
  selector: 'app-preferencias-notificacion',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, CheckboxModule],
  template: `
    <div class="preferencias-notificacion">
      <p class="text-sm text-gray-600 mb-4">
        Selecciona qué tipos de notificaciones deseas recibir:
      </p>

      <div class="preferencias-list">
        <div class="preferencia-item">
          <p-checkbox
            [(ngModel)]="preferencias.stockCritico"
            [binary]="true"
            inputId="stockCritico"
          />
          <label for="stockCritico" class="ml-2">
            <div class="preferencia-label">
              <span class="font-semibold">📦 Stock Crítico</span>
              <span class="text-sm text-gray-500">Alertas cuando el inventario está bajo</span>
            </div>
          </label>
        </div>

        <div class="preferencia-item">
          <p-checkbox
            [(ngModel)]="preferencias.facturaVencida"
            [binary]="true"
            inputId="facturaVencida"
          />
          <label for="facturaVencida" class="ml-2">
            <div class="preferencia-label">
              <span class="font-semibold">💰 Facturas Vencidas</span>
              <span class="text-sm text-gray-500">Notificaciones de facturas por cobrar vencidas</span>
            </div>
          </label>
        </div>

        <div class="preferencia-item">
          <p-checkbox
            [(ngModel)]="preferencias.aprobacionPendiente"
            [binary]="true"
            inputId="aprobacionPendiente"
          />
          <label for="aprobacionPendiente" class="ml-2">
            <div class="preferencia-label">
              <span class="font-semibold">✅ Aprobaciones Pendientes</span>
              <span class="text-sm text-gray-500">Solicitudes que requieren tu aprobación</span>
            </div>
          </label>
        </div>

        <div class="preferencia-item">
          <p-checkbox
            [(ngModel)]="preferencias.tareaAsignada"
            [binary]="true"
            inputId="tareaAsignada"
          />
          <label for="tareaAsignada" class="ml-2">
            <div class="preferencia-label">
              <span class="font-semibold">📋 Tareas Asignadas</span>
              <span class="text-sm text-gray-500">Cuando te asignan una nueva tarea</span>
            </div>
          </label>
        </div>

        <div class="preferencia-item">
          <p-checkbox
            [(ngModel)]="preferencias.mensajeSistema"
            [binary]="true"
            inputId="mensajeSistema"
          />
          <label for="mensajeSistema" class="ml-2">
            <div class="preferencia-label">
              <span class="font-semibold">🔔 Mensajes del Sistema</span>
              <span class="text-sm text-gray-500">Anuncios y actualizaciones importantes</span>
            </div>
          </label>
        </div>
      </div>

      <div class="flex justify-end gap-2 mt-4">
        <p-button
          label="Cancelar"
          severity="secondary"
          (onClick)="cargarPreferencias()"
        />
        <p-button
          label="Guardar Preferencias"
          [loading]="guardando()"
          (onClick)="guardarPreferencias()"
        />
      </div>
    </div>
  `,
  styles: [`
    .preferencias-notificacion {
      padding: 1rem 0;
    }

    .preferencias-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .preferencia-item {
      display: flex;
      align-items: flex-start;
      padding: 1rem;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      background: #f9fafb;
      transition: background-color 0.2s;
    }

    .preferencia-item:hover {
      background: #f3f4f6;
    }

    .preferencia-label {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    label {
      cursor: pointer;
      flex: 1;
    }
  `]
})
export class PreferenciasNotificacion implements OnInit {
  private perfilService = inject(PerfilService);
  private toast = inject(ToastService);

  preferencias = {
    stockCritico: true,
    facturaVencida: true,
    aprobacionPendiente: true,
    tareaAsignada: true,
    mensajeSistema: true,
  };

  guardando = signal<boolean>(false);

  ngOnInit() {
    // TODO: Descomentar cuando el backend implemente el endpoint /perfil/preferencias
    // this.cargarPreferencias();
  }

  cargarPreferencias() {
    this.perfilService.obtenerPreferencias().subscribe({
      next: (data) => {
        if (data && data.notificaciones) {
          this.preferencias = { ...data.notificaciones };
        }
      },
      error: (error) => {
        console.error('Error al cargar preferencias:', error);
      },
    });
  }

  guardarPreferencias() {
    this.guardando.set(true);
    this.perfilService
      .guardarPreferencias({ notificaciones: this.preferencias })
      .subscribe({
        next: () => {
          this.toast.success('Preferencias guardadas exitosamente');
          this.guardando.set(false);
        },
        error: (error) => {
          this.toast.error(error.message || 'Error al guardar preferencias');
          this.guardando.set(false);
        },
      });
  }
}
