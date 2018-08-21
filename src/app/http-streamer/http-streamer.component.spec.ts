import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpStreamerComponent } from './http-streamer.component';

describe('HttpStreamerComponent', () => {
  let component: HttpStreamerComponent;
  let fixture: ComponentFixture<HttpStreamerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HttpStreamerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HttpStreamerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
