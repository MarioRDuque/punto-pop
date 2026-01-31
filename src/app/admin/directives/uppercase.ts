import { Directive, ElementRef, HostListener, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appUppercase]'
})
export class Uppercase implements OnInit, OnDestroy {

  private control = inject(NgControl);
  private el = inject(ElementRef<HTMLInputElement>);

  @Input('appUppercase') uppercase = false;

  private sub!: Subscription;

  ngOnInit(): void {
    if (!this.uppercase || !this.control?.control) return;
    // Escucha valores que vienen de afuera (edit / patchValue / export)
    this.sub = this.control.control.valueChanges.subscribe(value => {
      if (value && value !== value.toUpperCase()) {
        const upper = value.toUpperCase();
        // actualiza input
        this.el.nativeElement.value = upper;
        // actualiza formControl sin loop
        this.control.control?.setValue(upper, { emitEvent: false });
      }
    });

    // Caso inicial (cuando carga el formulario)
    const initialValue = this.control.control.value;
    if (initialValue) {
      const upper = initialValue.toUpperCase();
      this.el.nativeElement.value = upper;
      this.control.control.setValue(upper, { emitEvent: false });
    }
  }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    if (!this.uppercase) return;

    const input = event.target as HTMLInputElement;
    const start = input.selectionStart;
    const end = input.selectionEnd;

    const upperValue = input.value.toUpperCase();

    input.value = upperValue;
    this.control.control?.setValue(upperValue, { emitEvent: false });

    if (start !== null && end !== null) {
      setTimeout(() => input.setSelectionRange(start, end));
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
