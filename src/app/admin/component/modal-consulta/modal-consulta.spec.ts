import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalConsulta } from './modal-consulta';

describe('ModalConsulta', () => {
  let component: ModalConsulta;
  let fixture: ComponentFixture<ModalConsulta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalConsulta]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalConsulta);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
