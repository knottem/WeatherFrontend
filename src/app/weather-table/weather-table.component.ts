import { Component, Input } from '@angular/core';
import { WeatherData } from '../../models/weather-data';
import { WeatherService } from '../weather.service';
import { trigger, style, animate, transition, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-weather-table',
  templateUrl: './weather-table.component.html',
  animations: [
    trigger('fadeInStagger', [
      transition('* => noAnimation', []),
      transition('* => animation', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(-20px)' }),
          stagger('5ms', [
            animate('100ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true }),
        query(':leave', [
          stagger('-5ms', [
            animate('100ms ease-in', style({ opacity: 0, height: '0px' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('fadeInExpand', [
      transition(':enter', [
        style({ opacity: 0, height: '0px', overflow: 'hidden' }),
        animate('100ms ease-out', style({ opacity: 1, height: '*' }))
      ])
    ])
  ]
})

export class WeatherTableComponent {
  @Input() dayLabel: string = "";
  @Input() cityName: string = "";
  @Input() weather: WeatherData = new WeatherData();

  private imageCache = new Map<string, string>();

  public showWeather: boolean = false;

  public highTemp: number = 0;
  public lowTemp: number = 0;
  public totalPrecipitation: number = 0;

  public morningWeather: number = -1;
  public afternoonWeather: number = -1;
  public eveningWeather: number = -1;
  public nightWeather: number = -1;
  public maxWindSpeed: number = 0;
  public averageWindDirection: number = 0;

  constructor(private weatherService: WeatherService) { }

  ngOnInit() {
    if (this.getTimestamps().length === 1) {
      this.showWeather = true;
    }
    // go thru weatherData and find the highest and lowest temps
    for (let timestamp in this.weather.weatherData) {
      const weather = this.weather.weatherData[timestamp];
      if (weather.temperature > this.highTemp) {
        this.highTemp = weather.temperature;
      }
      if (weather.temperature < this.lowTemp || this.lowTemp === 0) {
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
  }

  private calculateCommonWeather(): void {
    let morningCodes: number[] = [];
    let afternoonCodes: number[] = [];
    let eveningCodes: number[] = [];
    let nightCodes: number[] = [];

    let timestamps = Object.keys(this.weather.weatherData);

    timestamps.forEach(timestamp => {
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
    let maxEl = codes[0], maxCount = 1;
    codes.forEach(code => {
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

    Object.values(this.weather.weatherData).forEach(data => {
      const angleRadians = data.windDirection * Math.PI / 180;
      sinSum += Math.sin(angleRadians);
      cosSum += Math.cos(angleRadians);
      count++;
    });

    if (count > 0) {
      this.averageWindDirection = Math.round(Math.atan2(sinSum / count, cosSum / count) * 180 / Math.PI);
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
    if (!(this.getTimestamps().length === 1)) {
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
    if(!this.imageCache.has(cacheKey)){
      const image = this.weatherService.getWeatherConditionImage(code, day);
      this.imageCache.set(cacheKey, image);
      return image;
    }
    return this.imageCache.get(cacheKey) as string;
  }

  // should return a boolean depending on timestamp we'll ignore sunrise/sunset for now
  // between 18:00 and 6:00 is night
  // between 6:00 and 18:00 is day
  public isDayTime(timestamp: string): boolean {
    const hour = parseInt(timestamp.substring(11, 13));
    const isDay = hour >= 6 && hour < 18;
    return isDay;
  }


}