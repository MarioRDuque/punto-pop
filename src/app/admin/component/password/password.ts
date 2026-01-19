import { Component, inject, Input, Optional } from '@angular/core';
import { ControlContainer, FormControl, FormGroupDirective, ReactiveFormsModule } from '@angular/forms';
import { FloatLabelModule } from "primeng/floatlabel";
import { PasswordModule } from "primeng/password";
import { Errors } from '../../directives/errors';

@Component({
  selector: 'app-password',
  imports: [FloatLabelModule, PasswordModule, ReactiveFormsModule, Errors],
  templateUrl: './password.html',
  styleUrl: './password.scss',
  viewProviders: [
    {
      provide: ControlContainer,
      useExisting: FormGroupDirective
    }
  ]
})
export class PasswordComponent {

  @Input() label!: string;
  @Input() id!: string;
  @Optional() private controlContainer = inject(ControlContainer)

  get control(): FormControl {
    return this.controlContainer
      .control
      ?.get(this.id) as FormControl;
  }

}
