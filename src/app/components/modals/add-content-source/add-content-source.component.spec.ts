import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddContentSourceComponent } from './add-content-source.component';

describe('AddContentSourceComponent', () => {
  let component: AddContentSourceComponent;
  let fixture: ComponentFixture<AddContentSourceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddContentSourceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddContentSourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
