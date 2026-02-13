import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toast } from 'primeng/toast';
import { ToastService } from './admin/service/toast.service';
import { Cargando } from "./admin/component/cargando/cargando";
import { CargandoService } from './admin/service/cargando.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toast, Cargando],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {

  protected readonly title = signal('punto-pop');
  toast = inject(ToastService);
  cargando = inject(CargandoService);

}
