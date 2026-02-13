import { Component } from '@angular/core';
import { UsuarioFormulario } from "../usuarios/usuario-formulario/usuario-formulario";

@Component({
  selector: 'app-perfil',
  imports: [UsuarioFormulario],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss',
})
export class Perfil {
  public subtitulo = 'Perfil';

}
