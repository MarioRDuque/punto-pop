import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusBarFiltros } from './status-bar-filtros';

describe('StatusBarFiltros', () => {
  let component: StatusBarFiltros;
  let fixture: ComponentFixture<StatusBarFiltros>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusBarFiltros]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatusBarFiltros);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
