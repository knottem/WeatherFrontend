import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WeatherTableComponent } from './weather-table.component';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('WeatherTableComponent', () => {
  let component: WeatherTableComponent;
  let fixture: ComponentFixture<WeatherTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    fixture = TestBed.createComponent(WeatherTableComponent);
    component = fixture.componentInstance;
    component.sunsetSunrise = ['mockSunrise', 'mockSunset'];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('isDayTime should return true when the current time is between sunrise and sunset', () => {
    component.sunsetSunrise = [
      new Date(0, 0, 0, 6).toISOString(),
      new Date(0,0,0,18).toISOString()
    ];
    expect(component.isDayTime(new Date(0,0,0,12).toISOString()))
      .toBeTruthy();
  });

  it('isDayTime should return false when the current time is outside sunrise and sunset', () => {
    component.sunsetSunrise = [
      new Date(0, 0, 0, 6).toISOString(),
      new Date(0,0,0,18).toISOString()
    ];
    expect(component.isDayTime(new Date(0,0,0,20).toISOString()))
      .toBeFalse();
  });

});
