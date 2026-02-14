import { Component, inject, OnInit } from '@angular/core';
import { UsuarioFormulario } from "../usuarios/usuario-formulario/usuario-formulario";
import { FormsService } from '../../../service/forms-service';
import { AccionEnum } from '../../../enums/accion-enum';
import { UsuariosService } from '../usuarios/usuarios.service';
import { ConfUsuario } from '../../../entities/ConfUsuario';
import { CargandoService } from '../../../service/cargando.service';

@Component({
  selector: 'app-perfil',
  imports: [UsuarioFormulario],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss',
})
export class Perfil implements OnInit {

  formsService = inject(FormsService);
  cargando = inject(CargandoService);
  usuariosService = inject(UsuariosService);

  public usuario: ConfUsuario = new ConfUsuario();

  public subtitulo = 'Perfil';
  public mostrarPerfil = false;


  ngOnInit(): void {
    this.obtenerUsuario();
  }

  obtenerUsuario() {
    this.cargando.activar();
      this.usuariosService.obtenerUsuario("admin")
        .subscribe({
          next: (data) => this.despuesDeObtenerUsuario(data),
        });
  }

  despuesDeObtenerUsuario(data: ConfUsuario) {
    this.usuario = data;
    this.formsService.objetoSeleccionado.set(data);
    this.formsService.accion.set(AccionEnum.EDITAR);
    this.cargando.inactivar();
    this.mostrarPerfil = true;
  }

}
