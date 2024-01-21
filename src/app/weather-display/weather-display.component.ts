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

  private defaultCity: string = "stockholm";

  public weather: WeatherData = new WeatherData();
  public currentWeather: any;
  public tomorrowWeather: any;
  public dayAfterTomorrowWeather: any;
  
  public currentTimestamp: string = "";
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

  constructor(
    private weatherService: WeatherService,
    private searchService: SearchService) {}

  ngOnInit() {
    this.searchService.searchQuery$.subscribe((query) => {
      this.getWeather(query);
    });

    const data = JSON.parse(localStorage.getItem('weather') as string);
    let weather = null;
    let city = this.defaultCity;
    if (data !== null) {
      city = data.city.name;
      const cachedTime = new Date(data.timestamp).getTime();
      if (new Date().getTime() - cachedTime < (60 * 60 * 1000)) {
        weather = data;
      }
    }
    if (weather !== null) {
      this.processWeatherData(weather);
    } else {
      this.getWeather(city);
    }
  }

  public getWeatherConditionDescription(code: number): string {
    return this.weatherService.getWeatherCondition(code);
  }

  // Toggles the visibility of the weather for a specific day
  public toggleWeather(day: 'today' | 'tomorrow' | 'dayAfterTomorrow'): void {
    this.showTodaysWeather = day === 'today' ? !this.showTodaysWeather : false;
    this.showTomorrowsWeather = day === 'tomorrow' ? !this.showTomorrowsWeather : false;
    this.showDayAfterTomorrow = day === 'dayAfterTomorrow' ? !this.showDayAfterTomorrow : false;
    this.expandedRow = [];
  }

  private getWeather(str: string) {
    if (str === "") {
      return;
    }
    this.isLoaded = false;
    this.weatherService.getWeather(str).subscribe((data) => {
      this.processWeatherData(data)
    });
  }

  private processWeatherData(data: any): void {
    this.showTodaysWeather = false;
    this.showTomorrowsWeather = false;
    this.showDayAfterTomorrow = false;
    this.expandedRow = [];

    this.weather = this.convertToLocaleTime(data);
    this.availableTimestamps = this.filterTimestamps(Object.keys(this.weather.weatherData));

    this.timestampsToday = this.getTimeStamps(this.availableTimestamps, "today");
    this.timestampsTomorrow = this.getTimeStamps(this.availableTimestamps, "tomorrow");
    this.timestampsDayAfterTomorrow = this.getTimeStamps(this.availableTimestamps, "dayAfterTomorrow");

    this.currentWeather = this.weather.weatherData[this.availableTimestamps[0]];
    this.tomorrowWeather = this.getWeatherClosestToNoon(this.timestampsTomorrow);
    this.dayAfterTomorrowWeather = this.getWeatherClosestToNoon(this.timestampsDayAfterTomorrow);
    this.currentTimestamp = this.availableTimestamps[0].substring(11, 16);
    this.updatedTime = this.convertTimestampToLocale(this.weather.timestamp).substring(11, 16);
    this.dayAfterTomorrow = DateTime.local().plus({ days: 2 }).toFormat('cccc');

    if (this.weather.message !== "Mock data") {
      localStorage.setItem(`weather`, JSON.stringify(data));
    }
    this.isLoaded = true;
  }

  public toggleDetailRow(index: number, event: Event): void {
    event.stopPropagation();
    this.expandedRow[index] = !this.expandedRow[index];
  }

  public onAnimationDone(index: number): void {
    if (this.collapsingIndex === index) {
      this.collapsingIndex = null;
    }
  }

  private getTimeStamps(timestamps: string[], day: string): string[] {
    const now = new Date();
    if (day === "tomorrow") {
      now.setDate(now.getDate() + 1);
    } else if (day === "dayAfterTomorrow") {
      now.setDate(now.getDate() + 2);
    }
    const timestampsDay = timestamps.filter(timestamp => {
      return new Date(timestamp).getDate() === now.getDate();
    }
    );
    return timestampsDay;
  }

  public filterTimestamps(timestamps: string[]): string[] {
    const now = new Date();
    const currentHour = now.getHours();

    return timestamps.filter(timestamp => {
      const timestampDate = new Date(timestamp);
      const timestampHour = timestampDate.getHours();
      return timestampHour >= currentHour || timestampDate > now;
    });
  }

  private convertTimestampToLocale(timestamp: string): string {
    const utcDateTime = DateTime.fromISO(timestamp, { zone: 'utc' });
    return utcDateTime.isValid ? utcDateTime.toLocal().toFormat('yyyy-MM-dd HH:mm:ss') : "";
  }


  private convertToLocaleTime(weatherData: WeatherData): WeatherData {
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

  private getWeatherClosestToNoon(timestamps: string[]): any {
    let closestTime = timestamps.reduce((prev, curr) => {
      let currHour = parseInt(curr.split(' ')[1].split(':')[0], 10);
      let prevHour = parseInt(prev.split(' ')[1].split(':')[0], 10);
      return (Math.abs(currHour - 12) < Math.abs(prevHour - 12) ? curr : prev);
    });

    return {
      ...this.weather.weatherData[closestTime],
      timestamp: closestTime
    };
  }

}