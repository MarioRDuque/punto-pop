import { Component, inject, OnInit } from '@angular/core';
import { UsuarioFormulario } from "../usuarios/usuario-formulario/usuario-formulario";
import { FormsService } from '../../../service/forms-service';
import { AccionEnum } from '../../../enums/accion-enum';
import { UsuariosService } from '../usuarios/usuarios.service';
import { ConfUsuario } from '../../../entities/ConfUsuario';
import { CargandoService } from '../../../service/cargando.service';
import { PerfilService } from './perfil.service';
import { DosFAService } from '../../../service/dos-fa.service';
import { AuthService } from '../../../service/auth.service';
import { CambioPassword } from './cambio-contraseña/cambio-contraseña';
import { DosFAPanel } from './dos-fa-panel/dos-fa-panel';
import { PreferenciasNotificacion } from './preferencias-notificacion/preferencias-notificacion';
import { HistorialSesiones } from './historial-sesiones/historial-sesiones';
import { SelectorIdioma } from './selector-idioma/selector-idioma';

/**
 * Componente de Perfil de Usuario
 * Requisitos: 17.1, 17.2, 17.3, 17.4, 17.5
 *
 * Muestra inmediatamente con datos de sesión (sin esperar al backend).
 * Si el backend responde, actualiza los datos con la info más reciente.
 */
@Component({
  selector: 'app-perfil',
  imports: [
    UsuarioFormulario,
    CambioPassword,
    DosFAPanel,
    PreferenciasNotificacion,
    HistorialSesiones,
    SelectorIdioma
  ],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss',
})
export class Perfil implements OnInit {

  formsService = inject(FormsService);
  cargando = inject(CargandoService);
  usuariosService = inject(UsuariosService);
  perfilService = inject(PerfilService);
  dosFAService = inject(DosFAService);
  authService = inject(AuthService);

  public usuario = this.formsService.objetoSeleccionado;
  public subtitulo = 'Perfil';
  public mostrarPerfil = false;

  ngOnInit(): void {
    this.cargarPerfil();
  }

  cargarPerfil() {
    const usuarioSesion = this.authService.usuario();

    if (!usuarioSesion) {
      console.error('No hay usuario autenticado');
      return;
    }

    // Mostrar inmediatamente con datos de sesión, sin esperar al backend
    const usuarioInicial = new ConfUsuario({
      usuUsername: usuarioSesion.username,
      usuNombre: usuarioSesion.nombre,
      usuApellidos: usuarioSesion.apellidos,
      usuEmail: usuarioSesion.email,
      usuTelefono: usuarioSesion.telefono ?? '',
      usuDireccion: usuarioSesion.direccion ?? '',
      usuEstado: true
    });
    this.formsService.objetoSeleccionado.set(usuarioInicial);
    this.formsService.accion.set(AccionEnum.PERFIL);
    this.mostrarPerfil = true;

    // Actualizar en segundo plano con datos frescos del backend
    this.usuariosService.obtenerUsuario(usuarioSesion.username).subscribe({
      next: (data) => {
        this.formsService.objetoSeleccionado.set(data);
        // Sincronizar la foto en la sesión para que topbar y avatar la reflejen
        if (data.usuFoto !== undefined) {
          this.authService.actualizarFoto(data.usuFoto ?? null);
        }
      },
      error: () => {
        // Si falla el backend, los datos de sesión ya están cargados — no hacer nada
      }
    });
  }

  validarContraseña(password: string): boolean {
    return this.perfilService.validarContraseña(password);
  }
}
