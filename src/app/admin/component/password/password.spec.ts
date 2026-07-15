import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { PasswordComponent } from './password';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, PasswordComponent],
  template: `
    <form [formGroup]="form">
      <app-password id="clave" label="Clave"></app-password>
    </form>
  `
})
class TestHostComponent {
  form = new FormBuilder().group({ clave: [''] });
}

describe('Password', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: PasswordComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideZonelessChangeDetection()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    component = fixture.debugElement.query(
      (el) => el.componentInstance instanceof PasswordComponent
    ).componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
