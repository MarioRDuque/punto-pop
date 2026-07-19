import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { PasswordRecoveryService } from './password-recovery.service';
import { environment } from '../../../environments/environment';

const baseUrl = environment.apiUrl;

describe('PasswordRecoveryService', () => {
  let service: PasswordRecoveryService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(PasswordRecoveryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('solicitarRecuperacion hace POST a /auth/forgot-password con el email', () => {
    service.solicitarRecuperacion({ email: 'cliente@puntopop.com' }).subscribe();

    const req = httpMock.expectOne(`${baseUrl}/auth/forgot-password`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'cliente@puntopop.com' });
    req.flush(null);
  });

  it('resetearContrasenia hace POST a /auth/reset-password con el token y la nueva clave', () => {
    service.resetearContrasenia({ token: 'un-token', nuevaClave: 'NuevaClave123' }).subscribe();

    const req = httpMock.expectOne(`${baseUrl}/auth/reset-password`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ token: 'un-token', nuevaClave: 'NuevaClave123' });
    req.flush(null);
  });
});
