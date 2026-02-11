import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RolFormulario } from './rol-formulario';

describe('RolFormulario', () => {
  let component: RolFormulario;
  let fixture: ComponentFixture<RolFormulario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RolFormulario]
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
