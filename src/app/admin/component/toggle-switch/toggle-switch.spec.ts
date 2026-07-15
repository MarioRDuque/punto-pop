import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { ToggleSwitchComponent } from './toggle-switch';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, ToggleSwitchComponent],
  template: `
    <form [formGroup]="form">
      <app-toggle-switch id="activo" label="Activo"></app-toggle-switch>
    </form>
  `
})
class TestHostComponent {
  form = new FormBuilder().group({ activo: [false] });
}

describe('ToggleSwitch', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: ToggleSwitchComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideZonelessChangeDetection()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    component = fixture.debugElement.query(
      (el) => el.componentInstance instanceof ToggleSwitchComponent
    ).componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
