import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeatherDisplayComponent } from './weather-display.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule } from "@ngx-translate/core";

describe('WeatherDisplayComponent', () => {
  let component: WeatherDisplayComponent;
  let fixture: ComponentFixture<WeatherDisplayComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, TranslateModule.forRoot()],
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
    const oneHourAgo = new Date(now.getTime() - 3600000).toISOString(); // One hour in the past
    const oneHourLater = new Date(now.getTime() + 3600000).toISOString(); // One hour in the future
    const twoHoursLater = new Date(now.getTime() + 7200000).toISOString(); // Two hours in the future

    const timestamps = [
      oneHourAgo,
      now.toISOString(),
      oneHourLater,
      twoHoursLater
    ];

    const filteredTimestamps = component.filterTimestamps(timestamps);
    expect(filteredTimestamps.length).toEqual(3);
    expect(filteredTimestamps).toEqual([
      now.toISOString(),
      oneHourLater,
      twoHoursLater
    ]);
  });
});
