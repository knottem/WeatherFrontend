import { Component, ViewChildren, QueryList, ViewChild } from '@angular/core';
import { CurrentWeather, WeatherData } from '../../models/weather-data';
import { WeatherService } from '../weather.service';
import { SharedService } from '../shared.service';
import { WeatherTableComponent } from '../weather-table/weather-table.component';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-weather-display',
  templateUrl: './weather-display.component.html'
})
export class WeatherDisplayComponent {

  @ViewChildren(WeatherTableComponent)
  private weatherTableComponent!: QueryList<WeatherTableComponent>;

  private defaultCity: string = 'stockholm';
  public amountOfDays: number = 3;

  private imageCache = new Map<string, string>();

  public weather: WeatherData = new WeatherData();
  public currentWeather: CurrentWeather = new CurrentWeather('', 0, 0, 0, 0, 0);
  public currentDays: string[] = [];
  public timestamps: string[][] = [];
  public isLoaded: boolean = false;
  public updatedTime: string = '';

  constructor(
    private weatherService: WeatherService,
    private sharedService: SharedService
  ) {}

  ngOnInit() {
    this.sharedService.searchQuery$.subscribe((query) => {
      this.getWeather(query);
    });

    const data = this.sharedService.loadWeatherData();
    let weather = null;
    let city = this.defaultCity;
    if (data !== null) {
      city = data.city.name;
      const cachedTime = new Date(data.timestamp).getTime();
      if (new Date().getTime() - cachedTime < 60 * 60 * 1000) {
        weather = data;
      }
    }
    if (weather !== null) {
      this.processWeatherData(weather);
    } else {
      this.getWeather(city);
    }
  }

  public amountOfDaysChanged(num: number): void {
    this.amountOfDays = num;
    this.weatherTableComponent.forEach((table) => {
      table.showWeather = false;
    });
  }

  private getWeather(str: string) {
    if (str === '') {
      return;
    }
    this.isLoaded = false;
    this.weatherService.getWeather(str).subscribe((data) => {
      this.processWeatherData(data);
    });
  }

  private processWeatherData(data: any): void {
    const copy = JSON.parse(JSON.stringify(data)); // Deep copy
    this.weather = this.convertToLocaleTime(copy);
    const availableTimestamps = this.filterTimestamps(
      Object.keys(this.weather.weatherData)
    );
    this.timestamps = this.getTimeStamps(availableTimestamps);
    this.currentDays = this.getDay();
    this.currentWeather = new CurrentWeather(
      availableTimestamps[0],
      this.weather.weatherData[availableTimestamps[0]].temperature,
      this.weather.weatherData[availableTimestamps[0]].weatherCode,
      this.weather.weatherData[availableTimestamps[0]].windSpeed,
      this.weather.weatherData[availableTimestamps[0]].windDirection,
      this.weather.weatherData[availableTimestamps[0]].precipitation
    );
    this.sharedService.setUpdatedTime(this.weather.timestamp.substring(11, 16));
    
    if (this.weather.message !== 'Mock data') {
      this.sharedService.saveWeatherData(data);
    }
    document.title = `${this.weather.city.name} - Weather`;
    this.isLoaded = true;
  }

  // return a list of days starting with today, tomorrow and then the next 8 days as weekdays
  // if the current time is after 23:00, the first day will be tomorrow, otherwise today
  private getDay(): string[] {
    const days: string[] = [];
    if (new Date().getHours() >= 23) {
      days.push('Tomorrow');
      for (let i = 2; i < 11; i++) {
        days.push(DateTime.local().plus({ days: i }).toFormat('cccc'));
      }
    } else {
      days.push('Today');
      days.push('Tomorrow');
      for (let i = 2; i < 10; i++) {
        days.push(DateTime.local().plus({ days: i }).toFormat('cccc'));
      }
    }

    return days;
  }

  // return a list of timestamps for the next 10 days
  private getTimeStamps(timestamps: string[]): string[][] {
    const timestampsSets: string[][] = [];
    let lasthour = false;
    if (new Date().getHours() >= 23) {
      lasthour = true;
    }
    for (let day = 0; day < 10; day++) {
      const now = new Date();
      if (lasthour) {
        now.setDate(now.getDate() + day + 1);
      } else {
        now.setDate(now.getDate() + day);
      }
      timestampsSets.push(
        timestamps.filter((timestamp) => {
          return new Date(timestamp).getDate() === now.getDate();
        })
      );
    } 
    return timestampsSets;
  }

  // return a list of timestamps that are later than the current hour
  public filterTimestamps(timestamps: string[]): string[] {
    const now = new Date();
    const currentHour = now.getHours();

    return timestamps.filter((timestamp) => {
      const timestampDate = new Date(timestamp);
      const timestampHour = timestampDate.getHours();
      return timestampHour >= currentHour || timestampDate > now;
    });
  }

  // Converts all timestamps in the WeatherData object to local time
  private convertToLocaleTime(weatherData: WeatherData): WeatherData {
    const weatherDataCopy: WeatherData = { ...weatherData };
    const convertedWeatherData: { [key: string]: any } = {};

    Object.keys(weatherDataCopy.weatherData).forEach((key) => {
      const formattedDateTime = this.convertTimestampToLocaleTime(key);
        const value = weatherDataCopy.weatherData[key];
        if (value !== null && value !== undefined) {
          convertedWeatherData[formattedDateTime] = value;
        }
      }
    );
    weatherDataCopy.timestamp = this.convertTimestampToLocaleTime(weatherDataCopy.timestamp);
    for (let i = 0; i < weatherDataCopy.city.sunriseList.length; i++) {
      weatherDataCopy.city.sunriseList[i] = this.convertTimestampToLocaleTime(weatherDataCopy.city.sunriseList[i]);
      weatherDataCopy.city.sunsetList[i] = this.convertTimestampToLocaleTime(weatherDataCopy.city.sunsetList[i]);
    }

    weatherDataCopy.weatherData = convertedWeatherData;
    return weatherDataCopy;
  }

  private convertTimestampToLocaleTime(timestamp: string): string {
    const utcDateTime = DateTime.fromISO(timestamp, { zone: 'utc' });
    if (utcDateTime.isValid) {
      return utcDateTime.toLocal().toFormat('yyyy-MM-dd HH:mm:ss');
    } 
    console.error(`Invalid timestamp: ${timestamp}`);
    return timestamp;
  }

  // returns a weather object for the timestamps starting with a copy of the original weather
  public getWeatherDataForDay(timestamps: string[]): WeatherData {
    const weatherDataForDay: WeatherData = { ...this.weather };
    weatherDataForDay.weatherData = timestamps.reduce(
      (filteredData, timestamp) => {
        filteredData[timestamp] = this.weather.weatherData[timestamp];
        return filteredData;
      },
      {} as Record<string, any>
    );

    return weatherDataForDay;
  }

  public getWeatherConditionDescription(code: number): string {
    return this.weatherService.getWeatherCondition(code);
  }

  // should return an image path depending on weather code and timestamp
  public getWeatherConditionImage(code: number, day: boolean): string {
    const cacheKey = `${code}-${day ? 'day' : 'night'}`;
    if (this.imageCache.has(cacheKey)) {
      this.imageCache.get(cacheKey) as string;
    }
    const image = this.weatherService.getWeatherConditionImage(code, day);
    this.imageCache.set(cacheKey, image);
    return image;
  }

   // should return a boolean depending on timestamp we'll ignore sunrise/sunset for now
   public isDayTime(timestamp: string): boolean {
    const sunriseHour = parseInt(this.weather.city.sunriseList[0].substring(11, 13));
    const sunsetHour = parseInt(this.weather.city.sunsetList[0].substring(11,13));
    const hour = parseInt(timestamp.substring(11, 13));
    return hour >= sunriseHour && hour <= sunsetHour;
  }

  public getSunsetSunrise(index: number): string[] {
    return [this.weather.city.sunriseList[index], this.weather.city.sunsetList[index]];
  }
}
