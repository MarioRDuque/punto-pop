import { Component, inject, Input, Optional } from '@angular/core';
import { FloatLabelModule } from "primeng/floatlabel";
import { MultiSelectModule } from "primeng/multiselect";
import { Errors } from '../../directives/errors';
import { ControlContainer, FormControl, FormGroupDirective, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-multiselect',
  imports: [
    MultiSelectModule,
    FloatLabelModule,
    Errors,
    ReactiveFormsModule
  ],
  templateUrl: './multiselect.html',
  styleUrl: './multiselect.scss',
  viewProviders: [
    {
      provide: ControlContainer,
      useExisting: FormGroupDirective
    }
  ]
})
export class MultiselectComponent<T extends Record<string, unknown>> {

  @Input({ required: true }) label!: string;
  @Input({ required: true }) options!: T[];
  @Input() id!: string;

  @Input({ required: true }) optionLabel!: string;
  @Input() optionValue?: string;
  @Input() showClear?: boolean = false;

  @Optional() private controlContainer = inject(ControlContainer)

  getLabel(item: T): string {
    return String(item[this.optionLabel]);
  }

  get control(): FormControl {
    return this.controlContainer
      .control
      ?.get(this.id) as FormControl;
  }

}
