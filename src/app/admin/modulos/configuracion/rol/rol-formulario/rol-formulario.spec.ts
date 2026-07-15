import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MessageService } from 'primeng/api';

import { RolFormulario } from './rol-formulario';

describe('RolFormulario', () => {
  let component: RolFormulario;
  let fixture: ComponentFixture<RolFormulario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RolFormulario],
      providers: [provideZonelessChangeDetection(), provideHttpClient(), provideNoopAnimations(), MessageService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RolFormulario);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
