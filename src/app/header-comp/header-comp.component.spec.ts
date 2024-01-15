import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderCompComponent } from './header-comp.component';

describe('HeaderCompComponent', () => {
  let component: HeaderCompComponent;
  let fixture: ComponentFixture<HeaderCompComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HeaderCompComponent]
    });
    fixture = TestBed.createComponent(HeaderCompComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('#updateCurrentTime should return a string in HH:MM format', () => {
    const time = component.updateCurrentTime();
    expect(time).toMatch(/^\d{2}:\d{2}$/);
  });

  it('#updateCurrentTime should return current time', () => {
    const time = component.updateCurrentTime();
    const now = new Date();
    const expected = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    expect(time).toEqual(expected);
  });

});