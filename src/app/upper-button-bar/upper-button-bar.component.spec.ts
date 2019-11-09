import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpperButtonBarComponent } from './upper-button-bar.component';

describe('UpperButtonBarComponent', () => {
  let component: UpperButtonBarComponent;
  let fixture: ComponentFixture<UpperButtonBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpperButtonBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpperButtonBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
