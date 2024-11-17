import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorCompComponent } from './error-comp.component';
import {TranslateModule} from "@ngx-translate/core";

describe('ErrorCompComponent', () => {
  let component: ErrorCompComponent;
  let fixture: ComponentFixture<ErrorCompComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
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
