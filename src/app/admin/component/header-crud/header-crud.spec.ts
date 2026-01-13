import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderCrud } from './header-crud';

describe('HeaderCrud', () => {
  let component: HeaderCrud;
  let fixture: ComponentFixture<HeaderCrud>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderCrud]
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
