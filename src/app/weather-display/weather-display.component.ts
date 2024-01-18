import { Component } from '@angular/core';
import { WeatherData } from '../../models/weather-data';
import { WeatherService } from '../weather.service';
import { SearchService } from '../search.service';
import { DateTime } from 'luxon';
import { trigger, style, animate, transition, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-weather-display',
  templateUrl: './weather-display.component.html',
  styleUrls: ['./weather-display.component.css'],
  animations: [
    trigger('fadeInStagger', [
      transition('* => *', [
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
        animate('300ms ease-out', style({ opacity: 1, height: '*' }))
      ])
    ])
  ]
})

export class WeatherDisplayComponent {
  public weather: WeatherData;
  public currentWeather: any;
  public currentTimestamp: string;
  public availableTimestamps: string[] = [];
  public timestampsToday: string[] = [];
  public timestampsTomorrow: string[] = [];
  public timestampsDayAfterTomorrow: string[] = [];

  public showTodaysWeather: boolean = false;
  public showTomorrowsWeather: boolean = false;
  public showDayAfterTomorrow: boolean = false;

  public isLoaded: boolean = false;
  public updatedTime: string = "";
  public dayAfterTomorrow: string = "";

  public expandedRow: boolean[] = [];
  public collapsingIndex: number | null = null;

  constructor(private weatherService: WeatherService, private searchService: SearchService) {
    this.weather = new WeatherData();
    this.currentWeather = {};
    this.currentTimestamp = "";
    const cachedData = this.getWeatherFromLocalStorage();
    if(cachedData != null){
      this.processWeatherData(cachedData);
    } else {
      this.getWeather("Stockholm");
    }
  }

  ngOnInit() {
    this.searchService.searchQuery$.subscribe((query) => {
      this.getWeather(query);
    });
  }

  private saveWeatherToLocalStorage(data: any): void {
    const dataWithTimestamp = {
      weatherData: data,
      timestamp: new Date().getTime()
    };
    localStorage.setItem(`weather`, JSON.stringify(dataWithTimestamp));
  }
  
  private getWeatherFromLocalStorage(): any | null {
    const item = localStorage.getItem(`weather`);
    if (item) {
      const dataWithTimestamp = JSON.parse(item);
      const tenMinutes = 10 * 60 * 1000;
      const currentTime = new Date().getTime();
  
      if (currentTime - dataWithTimestamp.timestamp < tenMinutes) {
        console.log("Using cached data for: " + dataWithTimestamp.weatherData.message)
        return dataWithTimestamp.weatherData;
      }
    }
    return null;
  }

  toggleWeatherToday() {
    this.showTodaysWeather = !this.showTodaysWeather;
    this.expandedRow = [];
  }


  toggleWeatherTomorrow() {
    this.showTomorrowsWeather = !this.showTomorrowsWeather;
    this.expandedRow = [];
  }

  toggleWeatherDayAfterTomorrow() {
    this.showDayAfterTomorrow = !this.showDayAfterTomorrow;
    this.expandedRow = [];
  }

  closeAllWeather(){
    this.showTodaysWeather = false;
    this.showTomorrowsWeather = false;
    this.showDayAfterTomorrow = false;
    this.expandedRow = [];
  }

  getDayAfterTomorrow(){
    return DateTime.local().plus({ days: 2 }).toFormat('cccc');
  }

  getWeather(str: string) {
    if (str === "") {
      return;
    }
    this.weatherService.getWeather(str).subscribe((data) => {
      this.processWeatherData(data)
    });
  }

  getWeatherConditionDescription(code: number): string {
    return this.weatherService.getWeatherCondition(code);
  }

  private processWeatherData(data: any): void {
    this.closeAllWeather();
    this.weather = this.convertToLocaleTime(data);
    this.availableTimestamps = this.filterTimestamps(Object.keys(this.weather.weatherData));
    
    this.processTimestamps(this.availableTimestamps);

    this.currentWeather = this.weather.weatherData[this.availableTimestamps[0]];
    this.currentTimestamp = this.availableTimestamps[0].substring(11, 16);
    this.updatedTime = this.convertTimestampToLocale(this.weather.timestamp).substring(11, 16);
    this.dayAfterTomorrow = this.getDayAfterTomorrow();

    if(this.weather.message !== "Mock data") {
      this.saveWeatherToLocalStorage(data);
    }
    this.isLoaded = true;
  }

  private processTimestamps(timestamps: string[]): void {
    this.timestampsToday = this.getTimeStamps(timestamps, "today");
    this.timestampsTomorrow = this.getTimeStamps(timestamps, "tomorrow");
    this.timestampsDayAfterTomorrow = this.getTimeStamps(timestamps, "dayAfterTomorrow");
  }

  toggleDetailRow(index: number): void {
    this.expandedRow[index] = !this.expandedRow[index];
  }

  onAnimationDone(index: number): void {
    if (this.collapsingIndex === index) {
      this.collapsingIndex = null;
    }
  }

  getTimeStamps(timestamps: string[], day: string): string[] {
    const now = new Date();
    if(day === "tomorrow") {
      now.setDate(now.getDate() + 1);
    } else  if(day === "dayAfterTomorrow") {
      now.setDate(now.getDate() + 2);
    }
    const timestampsDay = timestamps.filter(timestamp => {
      return new Date(timestamp).getDate() === now.getDate();
    }
    );
    return timestampsDay;
  }

  convertTimestamp(timestamp: Date) {
    const year = timestamp.getFullYear();
    const month = timestamp.getMonth() + 1;
    const day = timestamp.getDate();
    const hour = timestamp.getHours();
    return `${year}-${month}-${day}T${hour}:00`;
  }

  getCurrentTimestamp(timestamps: string[]) {
    // Get timestamp that is closest to current time
    const now = new Date();
    const nowTimestamp = this.convertTimestamp(now);
    const index = timestamps.indexOf(nowTimestamp);
    return timestamps[index];
  }

  filterTimestamps(timestamps: string[]): string[] {
    const now = new Date();
    const currentHour = now.getHours();
    
    return timestamps.filter(timestamp => {
      const timestampDate = new Date(timestamp);
      const timestampHour = timestampDate.getHours();
      return timestampHour >= currentHour || timestampDate > now;
    });
  }

  convertTimestampToLocale(timestamp: string) {
    const utcDateTime = DateTime.fromISO(timestamp, { zone: 'utc' });
    if (utcDateTime.isValid) {
      const localDateTime = utcDateTime.toLocal();
      const formattedDateTime = localDateTime.toFormat('yyyy-MM-dd HH:mm:ss');
      return formattedDateTime;
    }
    return "";
  }

  
  convertToLocaleTime(weatherData: WeatherData): WeatherData {
    const weatherDataCopy: WeatherData = { ...weatherData };
    const convertedWeatherData: { [key: string]: any } = {};
  
    Object.keys(weatherDataCopy.weatherData).forEach((key) => {
      const utcDateTime = DateTime.fromISO(key, { zone: 'utc' });
      if (utcDateTime.isValid) {
        const localDateTime = utcDateTime.toLocal();
        const formattedDateTime = localDateTime.toFormat('yyyy-MM-dd HH:mm:ss');
        const value = weatherDataCopy.weatherData[key];
        if (value !== null && value !== undefined) {
          convertedWeatherData[formattedDateTime] = value;
        }
      }
    });
    weatherDataCopy.weatherData = convertedWeatherData;
    return weatherDataCopy;
  }

}
