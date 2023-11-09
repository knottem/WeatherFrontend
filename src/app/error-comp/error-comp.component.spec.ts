import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorCompComponent } from './error-comp.component';

describe('ErrorCompComponent', () => {
  let component: ErrorCompComponent;
  let fixture: ComponentFixture<ErrorCompComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ErrorCompComponent]
    });
    fixture = TestBed.createComponent(ErrorCompComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
