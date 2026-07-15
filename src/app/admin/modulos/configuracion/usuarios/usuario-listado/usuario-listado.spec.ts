import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';

import { UsuarioListado } from './usuario-listado';

describe('UsuarioListado', () => {
  let component: UsuarioListado;
  let fixture: ComponentFixture<UsuarioListado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuarioListado],
      providers: [provideZonelessChangeDetection(), provideHttpClient(), MessageService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsuarioListado);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
