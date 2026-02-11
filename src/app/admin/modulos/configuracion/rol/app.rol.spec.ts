import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppRol } from './app.rol';

describe('AppRol', () => {
  let component: AppRol;
  let fixture: ComponentFixture<AppRol>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppRol]
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
