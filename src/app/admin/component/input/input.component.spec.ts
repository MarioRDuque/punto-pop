import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { InputComponent } from './input.component';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, InputComponent],
  template: `
    <form [formGroup]="form">
      <app-input id="nombre" label="Nombre"></app-input>
    </form>
  `
})
class TestHostComponent {
  form = new FormBuilder().group({ nombre: [''] });
}

describe('InputComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: InputComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideZonelessChangeDetection()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    component = fixture.debugElement.query(
      (el) => el.componentInstance instanceof InputComponent
    ).componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
