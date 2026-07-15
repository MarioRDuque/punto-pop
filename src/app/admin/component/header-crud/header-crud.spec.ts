import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { HeaderCrud } from './header-crud';

describe('HeaderCrud', () => {
  let component: HeaderCrud;
  let fixture: ComponentFixture<HeaderCrud>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderCrud],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderCrud);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
