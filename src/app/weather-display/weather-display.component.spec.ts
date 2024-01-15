import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeatherDisplayComponent } from './weather-display.component';

describe('WeatherDisplayComponent', () => {
  let component: WeatherDisplayComponent;
  let fixture: ComponentFixture<WeatherDisplayComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WeatherDisplayComponent]
    });
    fixture = TestBed.createComponent(WeatherDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should filter timestamps', () => {
    const now = new Date();
    const timestamps = [
      new Date(now.getTime() - 7200000).toISOString(), // One hour in the future
      new Date(now.getTime() - 3600000).toISOString(), // One hour in the past
      now.toISOString(), // Current timestamp
      new Date(now.getTime() + 3600000).toISOString(), // One hour in the future
      new Date(now.getTime() + 7200000).toISOString(), // Two hours in the future
    ];
    const filteredTimestamps = component.filterTimestamps(timestamps);
    expect(filteredTimestamps.length).toEqual(3);
  });
});
