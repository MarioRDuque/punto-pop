import { Component, inject, Input, Optional } from '@angular/core';
import { ControlContainer, FormControl, FormGroupDirective, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FloatLabel } from "primeng/floatlabel";
import { IconField } from "primeng/iconfield";
import { InputIcon } from "primeng/inputicon";
import { InputTextModule } from 'primeng/inputtext';
import { Errors } from '../../directives/errors';

@Component({
  selector: 'app-input',
  imports: [
    FloatLabel,
    IconField,
    InputIcon,
    ReactiveFormsModule,
    InputTextModule,
    Errors
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
  @Input() id!: string;
  @Input() autocomplete = 'off';

  @Optional() private controlContainer = inject(ControlContainer)

  get control(): FormControl {
    return this.controlContainer
      .control
      ?.get(this.id) as FormControl;
  }
}
