import { Directive, Input, OnChanges, forwardRef, ElementRef, HostListener, inject } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl, ValidationErrors } from '@angular/forms';

@Directive({
  selector: '[appDocumentLength]',
  providers: [
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => MaxLengthDinamyc), multi: true }
  ]
})
export class MaxLengthDinamyc implements Validator, OnChanges {

  @Input() appDocumentLength: 'D' | 'CE' | null | undefined = 'D';

  private min = 8;
  private max = 8;
  private onChange?: () => void;

  private el = inject(ElementRef);

  ngOnChanges(): void {
    if (this.appDocumentLength === 'D') {
      this.min = this.max = 8;
    } else {
      this.min = 1;
      this.max = 12;
    }
    this.onChange?.();
  }

  // Bloquea escritura de letras y evita superar límite
  @HostListener('keypress', ['$event'])
  onKeyPress(event: KeyboardEvent) {
    const char = event.key;
    const value = this.el.nativeElement.value;

    if (!/^\d$/.test(char) || value.length >= this.max) {
      event.preventDefault();
    }
  }

  // Limpia pegado y fuerza longitud máxima
  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const input = event.target;
    if (input instanceof HTMLInputElement) {
      let value = input.value.replace(/\D/g, '');
      if (value.length > this.max) value = value.slice(0, this.max);
      input.value = value;
    }
  }


  validate(control: AbstractControl): ValidationErrors | null {
    const value = (control.value || '').toString();
    if (!value) return null;
    if (this.appDocumentLength === 'D') {
      return (value.length !== this.min)
        ? { appDocumentLength: { required: this.min, actual: value.length } }
        : null;
    }
    if (value.length < this.min || value.length > this.max) {
      return { appDocumentLength: { required: this.min, min: this.min, max: this.max, actual: value.length } };
    }
    return null;
  }


  registerOnValidatorChange(fn: () => void) { this.onChange = fn; }
}
