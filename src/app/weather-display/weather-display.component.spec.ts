import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeatherDisplayComponent } from './weather-display.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('WeatherDisplayComponent', () => {
  let component: WeatherDisplayComponent;
  let fixture: ComponentFixture<WeatherDisplayComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [WeatherDisplayComponent]
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
    expect(filteredTimestamps[0]).toEqual(timestamps[2]);
    expect(filteredTimestamps[1]).toEqual(timestamps[3]);
    expect(filteredTimestamps[2]).toEqual(timestamps[4]);
  });
});
