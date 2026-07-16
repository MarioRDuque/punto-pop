import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { MessageService } from 'primeng/api';

import { ProductoService } from './producto.service';
import { CacheService } from '../../../service/cache.service';
import { CatProducto } from '../../../entities/CatProducto';
import { PageResponse } from '../../../entities/PageResponse';
import { environment } from '../../../../../environments/environment';

const baseUrl = environment.apiUrl;

const productoMock: CatProducto = {
  codigo: 'P001',
  nombre: 'Producto de prueba',
  precioVenta: 10,
  stock: 5,
  stockMinimo: 1,
  estado: true,
  categoriaId: 'CAT001',
  unidadMedidaId: 'UNI001',
  tarifaIvaId: 'IVA001',
};

describe('ProductoService', () => {
  let service: ProductoService;
  let httpMock: HttpTestingController;
  let cache: CacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideHttpClient(), provideHttpClientTesting(), MessageService],
    });
    service = TestBed.inject(ProductoService);
    httpMock = TestBed.inject(HttpTestingController);
    cache = TestBed.inject(CacheService);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('guardar hace POST a /catalogo/producto e invalida la cache', () => {
    spyOn(cache, 'invalidar');

    service.guardar(productoMock).subscribe();

    const req = httpMock.expectOne(`${baseUrl}/catalogo/producto`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(productoMock);
    req.flush(productoMock);

    expect(cache.invalidar).toHaveBeenCalledWith('productos');
  });

  it('actualizar hace PUT a /catalogo/producto/{codigo} e invalida la cache', () => {
    spyOn(cache, 'invalidar');

    service.actualizar(productoMock).subscribe();

    const req = httpMock.expectOne(`${baseUrl}/catalogo/producto/P001`);
    expect(req.request.method).toBe('PUT');
    req.flush(productoMock);

    expect(cache.invalidar).toHaveBeenCalledWith('productos');
  });

  it('eliminar hace DELETE a /catalogo/producto/{codigo} e invalida la cache', () => {
    spyOn(cache, 'invalidar');

    service.eliminar(productoMock).subscribe();

    const req = httpMock.expectOne(`${baseUrl}/catalogo/producto/P001`);
    expect(req.request.method).toBe('DELETE');
    req.flush(productoMock);

    expect(cache.invalidar).toHaveBeenCalledWith('productos');
  });

  it('cargar siempre pide soloActivos=false y arma filtro/q', () => {
    const page: PageResponse<CatProducto> = {
      content: [productoMock],
      totalElements: 1,
      totalPages: 1,
      number: 0,
      size: 20,
    };

    service.cargar('activos', 0, 20, 'prueba').subscribe();

    const req = httpMock.expectOne((r) => r.url === `${baseUrl}/catalogo/producto/buscar`);
    expect(req.request.params.get('soloActivos')).toBe('false');
    expect(req.request.params.get('filtro')).toBe('activos');
    expect(req.request.params.get('q')).toBe('prueba');
    req.flush(page);

    expect(service.totalProductos()).toBe(1);
  });

  it('cargarTodos llena listaProductos con todo el contenido', () => {
    const page: PageResponse<CatProducto> = {
      content: [productoMock],
      totalElements: 1,
      totalPages: 1,
      number: 0,
      size: 9999,
    };

    service.cargarTodos().subscribe();

    const req = httpMock.expectOne((r) => r.url === `${baseUrl}/catalogo/producto/buscar`);
    req.flush(page);

    expect(service.listaProductos()).toEqual([productoMock]);
  });

  it('actualizarElGrid reemplaza el item existente por codigo', () => {
    service.agregarAlGrid(productoMock);
    const actualizado: CatProducto = { ...productoMock, stock: 20 };

    service.actualizarElGrid(actualizado);

    expect(service.listaProductos()).toEqual([actualizado]);
  });
});
