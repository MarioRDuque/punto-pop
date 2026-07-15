import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';

import { RolListado } from './rol-listado';

describe('RolListado', () => {
  let component: RolListado;
  let fixture: ComponentFixture<RolListado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RolListado],
      providers: [provideZonelessChangeDetection(), provideHttpClient(), MessageService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RolListado);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
