import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteContentSourceComponent } from './delete-content-source.component';

describe('DeleteContentSourceComponent', () => {
  let component: DeleteContentSourceComponent;
  let fixture: ComponentFixture<DeleteContentSourceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeleteContentSourceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteContentSourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
