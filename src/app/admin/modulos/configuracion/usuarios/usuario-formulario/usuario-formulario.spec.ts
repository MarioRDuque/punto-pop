import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';

import { UsuarioFormulario } from './usuario-formulario';

describe('UsuarioFormulario', () => {
  let component: UsuarioFormulario;
  let fixture: ComponentFixture<UsuarioFormulario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuarioFormulario],
      providers: [provideZonelessChangeDetection(), provideHttpClient(), MessageService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsuarioFormulario);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
