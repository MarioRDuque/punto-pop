import { Component, inject, Input, Optional } from '@angular/core';
import { ControlContainer, FormControl, FormGroupDirective, ReactiveFormsModule } from '@angular/forms';
import { FloatLabel } from "primeng/floatlabel";
import { IconField } from "primeng/iconfield";
import { InputIcon } from "primeng/inputicon";
import { InputTextModule } from 'primeng/inputtext';
import { Errors } from '../../directives/errors';
import { KeyFilter, KeyFilterPattern } from "primeng/keyfilter";
import { Uppercase } from "../../directives/uppercase";
import { AutoFocusModule } from 'primeng/autofocus';

@Component({
  selector: 'app-input',
  imports: [
    FloatLabel,
    IconField,
    InputIcon,
    ReactiveFormsModule,
    InputTextModule,
    Errors,
    KeyFilter,
    Uppercase,
    AutoFocusModule
],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
  viewProviders: [
    {
      provide: ControlContainer,
      useExisting: FormGroupDirective
    }
  ]
})
export class InputComponent {

  @Input() label!: string;
  @Input() icon?: string;
  @Input() keyFilter?: RegExp | KeyFilterPattern | null;
  @Input() id!: string;
  @Input() autocomplete = 'off';
  @Input() uppercase = true;
  @Input() autofocus = false;

  @Optional() private controlContainer = inject(ControlContainer)

  get control(): FormControl {
    return this.controlContainer
      .control
      ?.get(this.id) as FormControl;
  }
}
