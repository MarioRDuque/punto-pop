import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Fileupload } from './fileupload';

describe('Fileupload', () => {
  let component: Fileupload;
  let fixture: ComponentFixture<Fileupload>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Fileupload]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Fileupload);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
