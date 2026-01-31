import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccionButton } from './accion-button';

describe('AccionButton', () => {
  let component: AccionButton;
  let fixture: ComponentFixture<AccionButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccionButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccionButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
