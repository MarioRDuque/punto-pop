import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { MessageService } from 'primeng/api';

import { ClienteService } from './cliente.service';
import { CacheService } from '../../../service/cache.service';
import { VentaCliente } from '../../../entities/VentaCliente';
import { PageResponse } from '../../../entities/PageResponse';
import { environment } from '../../../../../environments/environment';

const baseUrl = environment.apiUrl;

const clienteMock: VentaCliente = {
  tipoIdentificacion: 'CEDULA',
  identificacion: '0102030405',
  nombre: 'Juan Pérez',
  estado: true,
};

describe('ClienteService', () => {
  let service: ClienteService;
  let httpMock: HttpTestingController;
  let cache: CacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideHttpClient(), provideHttpClientTesting(), MessageService],
    });
    service = TestBed.inject(ClienteService);
    httpMock = TestBed.inject(HttpTestingController);
    cache = TestBed.inject(CacheService);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('guardar hace POST a /ventas/cliente e invalida la cache', () => {
    spyOn(cache, 'invalidar');

    service.guardar(clienteMock).subscribe();

    const req = httpMock.expectOne(`${baseUrl}/ventas/cliente`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(clienteMock);
    req.flush(clienteMock);

    expect(cache.invalidar).toHaveBeenCalledWith('clientes');
  });

  it('actualizar hace PUT a /ventas/cliente/{identificacion} e invalida la cache', () => {
    spyOn(cache, 'invalidar');

    service.actualizar(clienteMock).subscribe();

    const req = httpMock.expectOne(`${baseUrl}/ventas/cliente/0102030405`);
    expect(req.request.method).toBe('PUT');
    req.flush(clienteMock);

    expect(cache.invalidar).toHaveBeenCalledWith('clientes');
  });

  it('eliminar hace DELETE a /ventas/cliente/{identificacion} e invalida la cache', () => {
    spyOn(cache, 'invalidar');

    service.eliminar(clienteMock).subscribe();

    const req = httpMock.expectOne(`${baseUrl}/ventas/cliente/0102030405`);
    expect(req.request.method).toBe('DELETE');
    req.flush(clienteMock);

    expect(cache.invalidar).toHaveBeenCalledWith('clientes');
  });

  it('cargar arma los query params y actualiza totalClientes + cache', () => {
    spyOn(cache, 'set');
    const page: PageResponse<VentaCliente> = {
      content: [clienteMock],
      totalElements: 1,
      totalPages: 1,
      number: 0,
      size: 20,
    };

    service.cargar('activos', 0, 20, 'Juan').subscribe();

    const req = httpMock.expectOne((r) => r.url === `${baseUrl}/ventas/cliente/buscar`);
    expect(req.request.params.get('filtro')).toBe('activos');
    expect(req.request.params.get('q')).toBe('Juan');
    req.flush(page);

    expect(service.totalClientes()).toBe(1);
    expect(cache.set).toHaveBeenCalledWith('clientes', [clienteMock]);
  });

  it('cargarTodos pide una página grande y llena listaClientes', () => {
    const page: PageResponse<VentaCliente> = {
      content: [clienteMock],
      totalElements: 1,
      totalPages: 1,
      number: 0,
      size: 9999,
    };

    service.cargarTodos().subscribe((result) => {
      expect(result).toEqual([clienteMock]);
    });

    const req = httpMock.expectOne((r) => r.url === `${baseUrl}/ventas/cliente/buscar`);
    expect(req.request.params.get('size')).toBe('9999');
    expect(req.request.params.has('filtro')).toBe(false);
    req.flush(page);

    expect(service.listaClientes()).toEqual([clienteMock]);
  });

  it('agregarAlGrid agrega el item a listaClientes', () => {
    service.agregarAlGrid(clienteMock);
    expect(service.listaClientes()).toEqual([clienteMock]);
  });

  it('actualizarElGrid reemplaza el item existente por identificacion', () => {
    service.agregarAlGrid(clienteMock);
    const actualizado: VentaCliente = { ...clienteMock, nombre: 'Juan P. Actualizado' };

    service.actualizarElGrid(actualizado);

    expect(service.listaClientes()).toEqual([actualizado]);
  });
});
