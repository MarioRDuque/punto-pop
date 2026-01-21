import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsuarioListado } from './usuario-listado';

describe('UsuarioListado', () => {
  let component: UsuarioListado;
  let fixture: ComponentFixture<UsuarioListado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuarioListado]
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
