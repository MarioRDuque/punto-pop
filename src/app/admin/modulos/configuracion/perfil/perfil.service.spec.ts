import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { MessageService } from 'primeng/api';
import { PerfilService } from './perfil.service';

describe('PerfilService', () => {
  let service: PerfilService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PerfilService,
        MessageService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideZonelessChangeDetection()
      ]
    });
    service = TestBed.inject(PerfilService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('validarContraseña', () => {
    it('debe aceptar contraseña válida', () => {
      expect(service.validarContraseña('Password123!')).toBe(true);
    });

    it('debe rechazar contraseña corta', () => {
      expect(service.validarContraseña('Pass1!')).toBe(false);
    });

    it('debe rechazar contraseña sin mayúscula', () => {
      expect(service.validarContraseña('password123!')).toBe(false);
    });

    it('debe rechazar contraseña sin número', () => {
      expect(service.validarContraseña('Password!')).toBe(false);
    });

    it('debe rechazar contraseña sin carácter especial', () => {
      expect(service.validarContraseña('Password123')).toBe(false);
    });
  });
});
