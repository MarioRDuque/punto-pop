import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { PerfilService } from '../perfil.service';
import { ToastService } from '../../../../service/toast.service';

interface Sesion {
  id: string;
  dispositivo: string;
  ip: string;
  fechaInicio: Date;
  activa: boolean;
  ubicacion?: string;
}

/**
 * Componente de Historial de Sesiones
 * Requisito 17.5: Historial de sesiones con opción de cerrar sesión remota
 */
@Component({
  selector: 'app-historial-sesiones',
  standalone: true,
  imports: [CommonModule, ButtonModule, TableModule, TagModule],
  template: `
    <div class="historial-sesiones">
      <p class="text-sm text-gray-600 mb-4">
        Gestiona las sesiones activas en tus dispositivos. Puedes cerrar sesiones remotas por seguridad.
      </p>

      @if (cargando()) {
        <div class="flex justify-center items-center py-8">
          <i class="pi pi-spin pi-spinner text-4xl text-gray-400"></i>
        </div>
      } @else if (sesiones().length === 0) {
        <div class="text-center py-8 text-gray-500">
          <i class="pi pi-info-circle text-4xl mb-2"></i>
          <p>No hay sesiones activas</p>
        </div>
      } @else {
        <p-table [value]="sesiones()" [tableStyle]="{ 'min-width': '50rem' }">
          <ng-template pTemplate="header">
            <tr>
              <th>Dispositivo</th>
              <th>IP</th>
              <th>Ubicación</th>
              <th>Fecha de Inicio</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-sesion>
            <tr>
              <td>
                <div class="flex items-center gap-2">
                  <i [class]="getDispositivoIcon(sesion.dispositivo)"></i>
                  <span>{{ sesion.dispositivo }}</span>
                </div>
              </td>
              <td>{{ sesion.ip }}</td>
              <td>{{ sesion.ubicacion || 'Desconocida' }}</td>
              <td>{{ formatearFecha(sesion.fechaInicio) }}</td>
              <td>
                <p-tag
                  [value]="sesion.activa ? 'Activa' : 'Inactiva'"
                  [severity]="sesion.activa ? 'success' : 'secondary'"
                />
              </td>
              <td>
                @if (sesion.activa) {
                  <p-button
                    icon="pi pi-sign-out"
                    severity="danger"
                    [text]="true"
                    [rounded]="true"
                    size="small"
                    pTooltip="Cerrar sesión"
                    tooltipPosition="top"
                    [loading]="cerrandoSesion() === sesion.id"
                    (onClick)="cerrarSesion(sesion)"
                  />
                }
              </td>
            </tr>
          </ng-template>
        </p-table>
      }

      <div class="flex justify-end mt-4">
        <p-button
          label="Actualizar"
          icon="pi pi-refresh"
          severity="secondary"
          [loading]="cargando()"
          (onClick)="cargarSesiones()"
        />
      </div>
    </div>
  `,
  styles: [`
    .historial-sesiones {
      padding: 1rem 0;
    }

    :host ::ng-deep {
      .p-datatable .p-datatable-thead > tr > th {
        background-color: #f9fafb;
        font-weight: 600;
        font-size: 0.875rem;
      }

      .p-datatable .p-datatable-tbody > tr > td {
        padding: 1rem;
      }
    }
  `]
})
export class HistorialSesiones implements OnInit {
  private perfilService = inject(PerfilService);
  private toast = inject(ToastService);

  sesiones = signal<Sesion[]>([]);
  cargando = signal<boolean>(false);
  cerrandoSesion = signal<string>('');

  ngOnInit() {
    // TODO: Descomentar cuando el backend implemente el endpoint /perfil/sesiones
    // this.cargarSesiones();
  }

  cargarSesiones() {
    this.cargando.set(true);
    this.perfilService.obtenerHistorialSesiones().subscribe({
      next: (data) => {
        this.sesiones.set(data);
        this.cargando.set(false);
      },
      error: (error) => {
        this.toast.error(error.message || 'Error al cargar historial de sesiones');
        this.cargando.set(false);
      },
    });
  }

  cerrarSesion(sesion: Sesion) {
    if (!confirm(`¿Estás seguro de cerrar la sesión en ${sesion.dispositivo}?`)) {
      return;
    }

    this.cerrandoSesion.set(sesion.id);
    this.perfilService.cerrarSesionRemota(sesion.id).subscribe({
      next: () => {
        this.toast.success('Sesión cerrada exitosamente');
        this.cerrandoSesion.set('');
        this.cargarSesiones();
      },
      error: (error) => {
        this.toast.error(error.message || 'Error al cerrar sesión');
        this.cerrandoSesion.set('');
      },
    });
  }

  getDispositivoIcon(dispositivo: string): string {
    const lower = dispositivo.toLowerCase();
    if (lower.includes('mobile') || lower.includes('android') || lower.includes('iphone')) {
      return 'pi pi-mobile text-blue-500';
    }
    if (lower.includes('tablet') || lower.includes('ipad')) {
      return 'pi pi-tablet text-purple-500';
    }
    return 'pi pi-desktop text-gray-500';
  }

  formatearFecha(fecha: Date): string {
    const date = new Date(fecha);
    const ahora = new Date();
    const diff = ahora.getTime() - date.getTime();
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);

    if (minutos < 1) return 'Ahora mismo';
    if (minutos < 60) return `Hace ${minutos} minuto${minutos > 1 ? 's' : ''}`;
    if (horas < 24) return `Hace ${horas} hora${horas > 1 ? 's' : ''}`;
    if (dias < 7) return `Hace ${dias} día${dias > 1 ? 's' : ''}`;

    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
