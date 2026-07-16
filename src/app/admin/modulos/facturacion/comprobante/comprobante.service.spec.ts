import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { MessageService } from 'primeng/api';

import { ComprobanteService } from './comprobante.service';
import { CargandoService } from '../../../service/cargando.service';
import { Comprobante } from '../../../entities/Comprobante';
import { environment } from '../../../../../environments/environment';

const baseUrl = environment.apiUrl;

const comprobanteMock: Comprobante = {
  id: '1',
  ventaId: 'v-1',
  estado: 'PENDIENTE',
};

describe('ComprobanteService', () => {
  let service: ComprobanteService;
  let httpMock: HttpTestingController;
  let cargando: CargandoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideHttpClient(), provideHttpClientTesting(), MessageService],
    });
    service = TestBed.inject(ComprobanteService);
    httpMock = TestBed.inject(HttpTestingController);
    cargando = TestBed.inject(CargandoService);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('obtenerPorVenta hace GET a /facturacion/comprobante/{ventaId} y controla el loading', () => {
    service.obtenerPorVenta('v-1').subscribe();

    expect(cargando.loading()).toBe(true);

    const req = httpMock.expectOne(`${baseUrl}/facturacion/comprobante/v-1`);
    expect(req.request.method).toBe('GET');
    req.flush(comprobanteMock);

    expect(cargando.loading()).toBe(false);
  });

  it('reintentar hace POST a /facturacion/comprobante/{ventaId}/reintentar y actualiza listaComprobantes', () => {
    service.listaComprobantes.set([comprobanteMock]);
    const autorizado: Comprobante = { ...comprobanteMock, estado: 'AUTORIZADO', numeroAutorizacion: '123' };

    service.reintentar('v-1').subscribe();

    const req = httpMock.expectOne(`${baseUrl}/facturacion/comprobante/v-1/reintentar`);
    expect(req.request.method).toBe('POST');
    req.flush(autorizado);

    expect(service.listaComprobantes()).toEqual([autorizado]);
  });

  it('reintentar no toca comprobantes de otras ventas en la lista', () => {
    const otraVenta: Comprobante = { id: '2', ventaId: 'v-2', estado: 'ERROR' };
    service.listaComprobantes.set([comprobanteMock, otraVenta]);
    const autorizado: Comprobante = { ...comprobanteMock, estado: 'AUTORIZADO' };

    service.reintentar('v-1').subscribe();

    const req = httpMock.expectOne(`${baseUrl}/facturacion/comprobante/v-1/reintentar`);
    req.flush(autorizado);

    expect(service.listaComprobantes()).toEqual([autorizado, otraVenta]);
  });

  it('cargar hace GET a /facturacion/comprobante y llena listaComprobantes', () => {
    service.cargar().subscribe();
    expect(cargando.loading()).toBe(true);

    const req = httpMock.expectOne(`${baseUrl}/facturacion/comprobante`);
    expect(req.request.method).toBe('GET');
    req.flush([comprobanteMock]);

    expect(service.listaComprobantes()).toEqual([comprobanteMock]);
    expect(cargando.loading()).toBe(false);
  });

  it('cargar desactiva el loading incluso si la petición falla', () => {
    service.cargar().subscribe({ error: () => undefined });
    expect(cargando.loading()).toBe(true);

    const req = httpMock.expectOne(`${baseUrl}/facturacion/comprobante`);
    req.flush('error', { status: 500, statusText: 'Server Error' });

    expect(cargando.loading()).toBe(false);
  });
});
