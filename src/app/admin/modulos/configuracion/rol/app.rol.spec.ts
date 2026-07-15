import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';

import { AppRol } from './app.rol';

describe('AppRol', () => {
  let component: AppRol;
  let fixture: ComponentFixture<AppRol>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppRol],
      providers: [provideZonelessChangeDetection(), provideHttpClient(), MessageService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppRol);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
