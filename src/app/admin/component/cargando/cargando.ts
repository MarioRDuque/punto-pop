import { Component } from '@angular/core';
import { BlockUI } from 'primeng/blockui';
import { ProgressBar } from 'primeng/progressbar';

@Component({
  selector: 'app-cargando',
  imports: [
    ProgressBar,
    BlockUI
  ],
  templateUrl: './cargando.html',
  styleUrl: './cargando.scss',
})
export class Cargando {
}
