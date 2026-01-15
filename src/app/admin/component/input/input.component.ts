import { Component, inject, Input, Optional } from '@angular/core';
import { ControlContainer, FormControl, FormGroupDirective, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FloatLabel } from "primeng/floatlabel";
import { IconField } from "primeng/iconfield";
import { InputIcon } from "primeng/inputicon";
import { InputTextModule } from 'primeng/inputtext';
import { Errors } from '../../directives/errors';
import { KeyFilter, KeyFilterPattern } from "primeng/keyfilter";

@Component({
  selector: 'app-input',
  imports: [
    FloatLabel,
    IconField,
    InputIcon,
    ReactiveFormsModule,
    InputTextModule,
    Errors,
    KeyFilter
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

  @Optional() private controlContainer = inject(ControlContainer)

  get control(): FormControl {
    return this.controlContainer
      .control
      ?.get(this.id) as FormControl;
  }
}
