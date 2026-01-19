import { CommonModule } from '@angular/common';
import { Component, inject, Input, Optional } from '@angular/core';
import { ControlContainer, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ToggleSwitchModule } from "primeng/toggleswitch";

@Component({
  selector: 'app-toggle-switch',
  imports: [ToggleSwitchModule, ReactiveFormsModule, CommonModule],
  templateUrl: './toggle-switch.html',
  styleUrl: './toggle-switch.scss',
})
export class ToggleSwitchComponent {

  @Input({ required: true }) label!: string;
  @Input() id!: string;
  @Optional() private controlContainer = inject(ControlContainer)

  get control(): FormControl {
    return this.controlContainer
      .control
      ?.get(this.id) as FormControl;
  }

}
