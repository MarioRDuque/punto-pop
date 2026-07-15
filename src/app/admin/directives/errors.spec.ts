import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { Errors } from './errors';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, Errors],
  template: `<input [formControl]="control" appErrors>`
})
class TestHostComponent {
  control = new FormControl('');
}

describe('Errors', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let directive: Errors;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideZonelessChangeDetection()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    directive = fixture.debugElement.query(By.directive(Errors)).injector.get(Errors);
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });
});
