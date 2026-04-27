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
export class MultiselectComponent<T extends object> {

  @Input({ required: true }) label!: string;
  @Input({ required: true }) options!: T[];
  @Input({ required: true }) id!: string;

  @Input({ required: true }) optionLabel!: Extract<keyof T, string>;
  @Input() optionValue?: Extract<keyof T, string>;
  @Input() showClear = false;

  @Optional() private controlContainer = inject(ControlContainer);

  getLabel(item: T): string {
    return String(item[this.optionLabel]);
  }

  getLabelByValue(value: unknown): string {
    if (this.optionValue) {
      const found = this.options?.find(
        (opt) => (opt as Record<string, unknown>)[this.optionValue!] === value
      );
      return found ? String((found as Record<string, unknown>)[this.optionLabel]) : String(value ?? '');
    }
    if (value === null || value === undefined) return '';
    return typeof value === 'object'
      ? String((value as Record<string, unknown>)[this.optionLabel])
      : String(value);
  }

  get control(): FormControl {
    return this.controlContainer
      .control
      ?.get(this.id) as FormControl;
  }
}
