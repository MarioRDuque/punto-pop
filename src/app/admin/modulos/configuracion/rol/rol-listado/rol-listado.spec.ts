import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RolListado } from './rol-listado';

describe('RolListado', () => {
  let component: RolListado;
  let fixture: ComponentFixture<RolListado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RolListado]
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
