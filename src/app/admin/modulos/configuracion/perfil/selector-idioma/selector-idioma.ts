import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectButton } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { IdiomaService, IdiomaDisponible } from '../../../../service/idioma.service';
import { ToastService } from '../../../../service/toast.service';

@Component({
  selector: 'app-selector-idioma',
  standalone: true,
  imports: [CommonModule, SelectButton, FormsModule],
  template: `
    <div class="card">
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-3">
          <i class="pi pi-language text-2xl text-primary"></i>
          <div>
            <h3 class="text-lg font-semibold m-0">Idioma del Sistema</h3>
            <p class="text-sm text-surface-600 dark:text-surface-400 m-0 mt-1">
              Selecciona el idioma de la interfaz
            </p>
          </div>
        </div>
        
        <div class="flex flex-col gap-2">
          <label class="font-medium">Idioma</label>
          <p-selectButton 
            [options]="opcionesIdioma" 
            [(ngModel)]="idiomaSeleccionado"
            (onChange)="cambiarIdioma()"
            optionLabel="label" 
            optionValue="value"
          />
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    
    .card {
      background: var(--surface-card);
      padding: 1.5rem;
      border-radius: 8px;
      border: 1px solid var(--surface-border);
    }
  `]
})
export class SelectorIdioma {
  
  private idiomaService = inject(IdiomaService);
  private toast = inject(ToastService);
  
  idiomaSeleccionado: IdiomaDisponible = this.idiomaService.getIdioma()();
  
  opcionesIdioma = [
    { label: '🇪🇸 Español', value: 'es' as IdiomaDisponible },
    { label: '🇺🇸 English', value: 'en' as IdiomaDisponible }
  ];

  cambiarIdioma() {
    this.idiomaService.cambiarIdioma(this.idiomaSeleccionado);
    
    const mensaje = this.idiomaSeleccionado === 'es' 
      ? 'Idioma cambiado a Español' 
      : 'Language changed to English';
    
    this.toast.success(mensaje);
  }
}
