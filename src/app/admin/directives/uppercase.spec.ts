import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { Uppercase } from './uppercase';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, Uppercase],
  template: `<input [formControl]="control" [appUppercase]="true">`
})
class TestHostComponent {
  control = new FormControl('');
}

describe('Uppercase', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let directive: Uppercase;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideZonelessChangeDetection()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    directive = fixture.debugElement.query(By.directive(Uppercase)).injector.get(Uppercase);
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });
});
