import { Component, Input } from '@angular/core';
import { WeatherData } from '../../models/weather-data';
import { WeatherService } from '../weather.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from "@ngx-translate/core";

@Component({
  selector: 'app-weather-table',
  templateUrl: './weather-table.component.html',

  standalone: true,
  imports: [CommonModule, TranslateModule]
})
export class WeatherTableComponent {
  @Input() dayLabel: string = '';
  @Input() weather: WeatherData = new WeatherData();
  @Input() sunsetSunrise: string[] = [];

  private imageCache = new Map<string, string>();

  public showWeather: boolean = false;
  public timestamps: string[] = [];

  public highTemp: number = -100;
  public lowTemp: number = 100;
  public totalPrecipitation: number = 0;

  public morningWeather: number = -1;
  public afternoonWeather: number = -1;
  public eveningWeather: number = -1;
  public nightWeather: number = -1;
  public maxWindSpeed: number = 0;
  public averageWindDirection: number = 0;

  constructor(private weatherService: WeatherService) {
  }

  ngOnInit() {
    this.timestamps = Object.keys(this.weather.weatherData);
    if (this.timestamps.length === 1) {
      this.showWeather = true;
    }
    // go through weatherData and find the highest and lowest temps
    for (let timestamp in this.weather.weatherData) {
      const weather = this.weather.weatherData[timestamp];
      if (weather.temperature > this.highTemp) {
        this.highTemp = weather.temperature;
      }
      if (weather.temperature < this.lowTemp) {
        this.lowTemp = weather.temperature;
      }
      if (weather.windSpeed > this.maxWindSpeed) {
        this.maxWindSpeed = weather.windSpeed;
      }

      this.totalPrecipitation += weather.precipitation;
    }
    this.totalPrecipitation = Math.round(this.totalPrecipitation * 10) / 10;
    this.calculateCommonWeather();
    this.calculateAverageWindDirection();

    if (this.dayLabel === 'Today') {
      this.timestamps.shift();
    }

  }

  private calculateCommonWeather(): void {
    let morningCodes: number[] = [];
    let afternoonCodes: number[] = [];
    let eveningCodes: number[] = [];
    let nightCodes: number[] = [];

    let timestamps = this.getTimestamps();

    timestamps.forEach((timestamp) => {
      let hour = parseInt(timestamp.substring(11, 13));
      if (hour >= 6 && hour < 12) {
        morningCodes.push(this.weather.weatherData[timestamp].weatherCode);
      } else if (hour >= 12 && hour < 18) {
        afternoonCodes.push(this.weather.weatherData[timestamp].weatherCode);
      } else if (hour >= 18 && hour < 24) {
        eveningCodes.push(this.weather.weatherData[timestamp].weatherCode);
      } else {
        nightCodes.push(this.weather.weatherData[timestamp].weatherCode);
      }
    });

    this.morningWeather = this.getMostCommonCode(morningCodes);
    this.afternoonWeather = this.getMostCommonCode(afternoonCodes);
    this.eveningWeather = this.getMostCommonCode(eveningCodes);
    this.nightWeather = this.getMostCommonCode(nightCodes);
  }

  private getMostCommonCode(codes: number[]): number {
    if (codes.length === 0) return -1;

    const modeMap = new Map();
    let maxEl = codes[0],
      maxCount = 1;
    codes.forEach((code) => {
      if (!modeMap.has(code)) {
        modeMap.set(code, 1);
      } else {
        let count = modeMap.get(code) + 1;
        modeMap.set(code, count);

        if (count > maxCount) {
          maxEl = code;
          maxCount = count;
        }
      }
    });
    return maxEl;
  }

  private calculateAverageWindDirection(): void {
    let sinSum = 0;
    let cosSum = 0;
    let count = 0;

    Object.values(this.weather.weatherData).forEach((data) => {
      const angleRadians = (data.windDirection * Math.PI) / 180;
      sinSum += Math.sin(angleRadians);
      cosSum += Math.cos(angleRadians);
      count++;
    });

    if (count > 0) {
      this.averageWindDirection = Math.round(
        (Math.atan2(sinSum / count, cosSum / count) * 180) / Math.PI
      );
      if (this.averageWindDirection < 0) {
        this.averageWindDirection += 360;
      }
    } else {
      this.averageWindDirection = 0;
    }
  }

  public getTimestamps(): string[] {
      return Object.keys(this.weather.weatherData);
  }

  public toggleWeather(): void {
    if (this.getTimestamps().length !== 1) {
      this.showWeather = !this.showWeather;
    }
  }

  public isTimeStampLengthOne(): boolean {
    return this.getTimestamps().length === 1;
  }

  public getWeatherConditionDescription(code: number): string {
    return this.weatherService.getWeatherCondition(code);
  }

  // should return an image path depending on weather code and timestamp
  public getWeatherConditionImage(code: number, day: boolean): string {
    const cacheKey = `${code}-${day ? 'day' : 'night'}`;
    if (!this.imageCache.has(cacheKey)) {
      const image = this.weatherService.getWeatherConditionImage(code, day);
      this.imageCache.set(cacheKey, image);
      return image;
    }
    return this.imageCache.get(cacheKey) as string;
  }

  // should return a boolean depending on timestamp and sunrise/sunset
  public isDayTime(timestamp: string): boolean {
    const sunriseHour = parseInt(this.sunsetSunrise[0].substring(11, 13));
    const sunsetHour = parseInt(this.sunsetSunrise[1].substring(11, 13));
    const hour = parseInt(timestamp.substring(11, 13));
    return hour >= sunriseHour && hour <= sunsetHour;
  }

  shouldEveningSpanTwoColumns(): boolean {
    if (this.nightWeather === -1 && this.morningWeather === -1 && this.afternoonWeather === -1) {
      return true;
    }
    if (this.nightWeather === -1 && this.morningWeather !== -1 && this.afternoonWeather !== -1) {
      return true;
    }
    return false;
  }

  shouldAfternoonSpanTwoColumns(): boolean {
    return this.eveningWeather === -1;

  }

  getWeatherTranslationKey(): string {
    return this.showWeather ? 'weatherTable.min' : 'weatherTable.max';
  }
}
