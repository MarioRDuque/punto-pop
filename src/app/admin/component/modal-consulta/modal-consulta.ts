import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-modal-consulta',
  imports: [
    ButtonModule,
    DialogModule,
    InputTextModule
  ],
  templateUrl: './modal-consulta.html',
  styleUrl: './modal-consulta.scss',
})
export class ModalConsulta {
  visible: boolean = false;

  showDialog() {
    this.visible = true;
  }
}
