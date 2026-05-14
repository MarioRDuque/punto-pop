import { Directive, ElementRef, OnDestroy, OnInit, Renderer2, inject, Input } from '@angular/core';
import { NgControl, FormGroupDirective } from '@angular/forms';
import { fromEvent, Subscription } from 'rxjs';

@Directive({
  selector: '[appErrors]',
})
export class Errors implements OnInit, OnDestroy {

  @Input() fieldName = '';

  private ngControl = inject(NgControl, { optional: true });
  private host = inject(ElementRef);
  private renderer = inject(Renderer2);
  private formGroup = inject(FormGroupDirective, { optional: true });

  private subs: Subscription[] = [];
  private errorContainer!: HTMLElement;
  private wrapper!: HTMLElement;

  ngOnInit() {
    if (!this.ngControl?.control) return;

    if (!this.fieldName) {
      this.fieldName = this.getFieldNameFromContext();
    }

    this.wrapper =
      this.host.nativeElement.closest('.p-float-label') ||
      this.host.nativeElement.closest('.field') ||
      this.host.nativeElement.parentElement;

    this.errorContainer = this.renderer.createElement('div');
    this.renderer.addClass(this.errorContainer, 'error-container');

    const fieldContainer = this.host.nativeElement.closest('.field');
    this.renderer.appendChild(fieldContainer ?? this.wrapper, this.errorContainer);

    this.subs.push(
      this.ngControl.statusChanges!.subscribe(() => this.updateErrors())
    );

    this.subs.push(
      this.ngControl.control.valueChanges!.subscribe(() => this.updateErrors())
    );

    this.subs.push(
      fromEvent(this.host.nativeElement, 'blur').subscribe(() => {
        this.ngControl?.control?.markAsTouched();
        this.updateErrors();
      })
    );

    if (this.formGroup) {
      this.subs.push(
        this.formGroup.ngSubmit.subscribe(() => {
          const control = this.ngControl?.control;
          control?.markAsTouched({ onlySelf: true });
          control?.updateValueAndValidity({ onlySelf: true });
          this.updateErrors();
        })
      );
    }
  }

  private updateErrors() {
    this.errorContainer.innerHTML = '';

    const control = this.ngControl?.control;
    if (!control || !control.touched || !control.errors) {
      this.renderer.removeClass(this.wrapper, 'p-invalid');
      return;
    }

    this.renderer.addClass(this.wrapper, 'p-invalid');

    Object.keys(control.errors).forEach(key => {
      const msg = this.getErrorMessage(key, control.errors![key]);
      if (msg) this.addError(msg);
    });
  }

  private addError(message: string) {
    const small = this.renderer.createElement('small');
    this.renderer.addClass(small, 'error-text');
    this.renderer.addClass(small, 'text-red-500');
    this.renderer.setStyle(small, 'font-size', '0.75rem');
    this.renderer.setStyle(small, 'display', 'block');
    this.renderer.appendChild(small, this.renderer.createText(message));
    this.renderer.appendChild(this.errorContainer, small);
  }

  private getErrorMessage(key: string, info: Record<string, unknown>): string | null {
    const fieldLabel = this.fieldName || 'Este campo';

    switch (key) {
      case 'required':
        return `${fieldLabel} es obligatorio.`;
      case 'email':
        return `${fieldLabel} debe ser un email válido.`;
      case 'minlength':
        return `${fieldLabel} debe tener mínimo ${info['requiredLength']} caracteres.`;
      case 'maxlength':
        return `${fieldLabel} debe tener máximo ${info['requiredLength']} caracteres.`;
      case 'min':
        return `${fieldLabel} debe ser mayor o igual a ${info['min']}.`;
      case 'max':
        return `${fieldLabel} debe ser menor o igual a ${info['max']}.`;
      case 'pattern':
        return `${fieldLabel} tiene un formato inválido.`;
      case 'identificacionInvalida': {
        const labels: Record<string, string> = { CEDULA: 'Cédula', RUC: 'RUC', PASAPORTE: 'Pasaporte' };
        const tipo = info['tipo'] as string;
        return `${labels[tipo] ?? fieldLabel} inválido.`;
      }
      case 'rucInvalido':
        return `RUC inválido.`;
      default:
        return null;
    }
  }

  private getFieldNameFromContext(): string {
    // 1. Buscar el componente app-input padre y obtener su atributo 'label'
    let currentElement: HTMLElement | null = this.host.nativeElement.parentElement;

    // Buscar hasta 5 niveles arriba para encontrar app-input
    for (let i = 0; i < 5 && currentElement; i++) {
      const tagName = currentElement.tagName.toLowerCase();
      if (tagName.startsWith('app-')) {
        const labelAttr = currentElement.getAttribute('label');
        if (labelAttr) {
          return labelAttr; //RETORNA EL NOMBRE DEL CAMPO
        }
        break;
      }
      currentElement = currentElement.parentElement;
    }


    // 2. Buscar label en .p-float-label (para otros componentes PrimeNG)
    const floatLabel = this.host.nativeElement.closest('.p-float-label');
    if (floatLabel) {
      const label = floatLabel.querySelector('label');
      if (label?.textContent) {
        return label.textContent.trim();
      }
    }

    // 3. Fallback
    return 'Este campo';
  }


  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }
}