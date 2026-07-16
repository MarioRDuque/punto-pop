import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { MessageService } from 'primeng/api';

import { VentaService } from './venta.service';
import { CacheService } from '../../../service/cache.service';
import { CargandoService } from '../../../service/cargando.service';
import { Venta } from '../../../entities/Venta';
import { PageResponse } from '../../../entities/PageResponse';
import { environment } from '../../../../../environments/environment';

const baseUrl = environment.apiUrl;

const ventaMock: Venta = {
  id: '1',
  numero: 'FV-001',
  subtotal: 10,
  descuento: 0,
  baseIva: 10,
  baseExenta: 0,
  iva: 1.2,
  total: 11.2,
  estado: 'PENDIENTE',
  formaPago: 'EFECTIVO',
  items: [],
};

describe('VentaService', () => {
  let service: VentaService;
  let httpMock: HttpTestingController;
  let cache: CacheService;
  let cargando: CargandoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideHttpClient(), provideHttpClientTesting(), MessageService],
    });
    service = TestBed.inject(VentaService);
    httpMock = TestBed.inject(HttpTestingController);
    cache = TestBed.inject(CacheService);
    cargando = TestBed.inject(CargandoService);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('guardar hace POST a /ventas/venta e invalida la cache', () => {
    spyOn(cache, 'invalidar');

    service.guardar(ventaMock).subscribe();

    const req = httpMock.expectOne(`${baseUrl}/ventas/venta`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(ventaMock);
    req.flush(ventaMock);

    expect(cache.invalidar).toHaveBeenCalledWith('ventas');
  });

  it('actualizar hace PUT a /ventas/venta/{id} e invalida la cache', () => {
    spyOn(cache, 'invalidar');

    service.actualizar(ventaMock).subscribe();

    const req = httpMock.expectOne(`${baseUrl}/ventas/venta/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(ventaMock);

    expect(cache.invalidar).toHaveBeenCalledWith('ventas');
  });

  it('completar hace POST a /ventas/venta/{id}/completar', () => {
    service.completar('1').subscribe();

    const req = httpMock.expectOne(`${baseUrl}/ventas/venta/1/completar`);
    expect(req.request.method).toBe('POST');
    req.flush({ ...ventaMock, estado: 'COMPLETADA' });
  });

  it('anular hace POST a /ventas/venta/{id}/anular', () => {
    service.anular('1').subscribe();

    const req = httpMock.expectOne(`${baseUrl}/ventas/venta/1/anular`);
    expect(req.request.method).toBe('POST');
    req.flush({ ...ventaMock, estado: 'ANULADA' });
  });

  it('cargar activa/inactiva el loading, arma los query params, y actualiza las señales', () => {
    const page: PageResponse<Venta> = {
      content: [ventaMock],
      totalElements: 1,
      totalPages: 1,
      number: 0,
      size: 20,
    };

    service.cargar('PENDIENTE', new Date('2026-01-01T08:30:00'), new Date('2026-01-31T18:00:00'), 0, 'FV').subscribe();

    expect(cargando.loading()).toBe(true);

    const req = httpMock.expectOne((r) => r.url === `${baseUrl}/ventas/venta/filtrar`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('estado')).toBe('PENDIENTE');
    expect(req.request.params.get('page')).toBe('0');
    expect(req.request.params.get('size')).toBe('20');
    expect(req.request.params.get('q')).toBe('FV');
    expect(req.request.params.get('desde')).toBe('2026-01-01T08:30:00');
    expect(req.request.params.get('hasta')).toBe('2026-01-31T18:00:00');

    req.flush(page);

    expect(service.listaVentas()).toEqual([ventaMock]);
    expect(service.totalVentas()).toBe(1);
    expect(cargando.loading()).toBe(false);
  });

  it('cargar sin filtros opcionales no agrega esos params', () => {
    const page: PageResponse<Venta> = { content: [], totalElements: 0, totalPages: 0, number: 0, size: 20 };

    service.cargar().subscribe();

    const req = httpMock.expectOne((r) => r.url === `${baseUrl}/ventas/venta/filtrar`);
    expect(req.request.params.has('estado')).toBe(false);
    expect(req.request.params.has('desde')).toBe(false);
    expect(req.request.params.has('hasta')).toBe(false);
    expect(req.request.params.has('q')).toBe(false);
    req.flush(page);
  });

  it('cargar desactiva el loading incluso si la petición falla', () => {
    service.cargar().subscribe({ error: () => undefined });

    const req = httpMock.expectOne((r) => r.url === `${baseUrl}/ventas/venta/filtrar`);
    req.flush('error', { status: 500, statusText: 'Server Error' });

    expect(cargando.loading()).toBe(false);
  });

  it('agregarAlGrid agrega el item a listaVentas e invalida la cache', () => {
    spyOn(cache, 'invalidar');

    service.agregarAlGrid(ventaMock);

    expect(service.listaVentas()).toEqual([ventaMock]);
    expect(cache.invalidar).toHaveBeenCalledWith('ventas');
  });

  it('actualizarElGrid reemplaza el item existente por id', () => {
    service.agregarAlGrid(ventaMock);
    const actualizada: Venta = { ...ventaMock, total: 99 };

    service.actualizarElGrid(actualizada);

    expect(service.listaVentas()).toEqual([actualizada]);
  });

  it('obtenerComprobante hace GET a /facturacion/comprobante/{ventaId}', () => {
    service.obtenerComprobante('1').subscribe();

    const req = httpMock.expectOne(`${baseUrl}/facturacion/comprobante/1`);
    expect(req.request.method).toBe('GET');
    req.flush({ ventaId: '1', estado: 'AUTORIZADO' });
  });
});
