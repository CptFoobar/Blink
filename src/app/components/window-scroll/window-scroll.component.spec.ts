import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WindowScrollComponent } from './window-scroll.component';

describe('WindowScrollComponent', () => {
  let component: WindowScrollComponent;
  let fixture: ComponentFixture<WindowScrollComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WindowScrollComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WindowScrollComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
