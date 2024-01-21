import { Component } from '@angular/core';
import { CurrentWeather, WeatherData } from '../../models/weather-data';
import { WeatherService } from '../weather.service';
import { SearchService } from '../search.service';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-weather-display',
  templateUrl: './weather-display.component.html',
  styleUrls: ['./weather-display.component.css']
})

export class WeatherDisplayComponent {

  private defaultCity: string = "stockholm";
  public amountOfDays: number = 3;

  public weather: WeatherData = new WeatherData();
  public currentWeather: CurrentWeather = new CurrentWeather("", 0, 0, 0, 0, 0);
  public currentDays: string[] = [];
  public timestamps: string[][] = [];
  public isLoaded: boolean = false;
  public updatedTime: string = ""

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
    this.weather = this.convertToLocaleTime(data);
    const availableTimestamps = this.filterTimestamps(Object.keys(this.weather.weatherData));
    this.timestamps = this.getTimeStamps(availableTimestamps);
    this.currentDays = this.getDay()
    this.currentWeather = new CurrentWeather(
      availableTimestamps[0].substring(11, 16), 
      this.weather.weatherData[availableTimestamps[0]].temperature, 
      this.weather.weatherData[availableTimestamps[0]].weatherCode, 
      this.weather.weatherData[availableTimestamps[0]].windSpeed, 
      this.weather.weatherData[availableTimestamps[0]].windDirection, 
      this.weather.weatherData[availableTimestamps[0]].precipitation);
    
    this.updatedTime = this.convertTimestampToLocale(this.weather.timestamp).substring(11, 16);
    if (this.weather.message !== "Mock data") {
      localStorage.setItem(`weather`, JSON.stringify(data));
    }
    this.isLoaded = true;
  }

  private getDay(): string[] {
    const days: string[] = [];
    for (let i = 0; i < 10; i++) {
      if(i === 0) {
        days.push("Today");
        continue;
      } else if (i === 1) {
        days.push("Tomorrow");
        continue;
      }
      days.push(DateTime.local().plus({ days: i }).toFormat('cccc'));
    }
    return days;
  }

  private getTimeStamps(timestamps: string[]): string[][] {
    const timestampsSets: string[][] = [];
    for (let day = 0; day < 10; day++) {
      const now = new Date();
      now.setDate(now.getDate() + day);
      timestampsSets.push(timestamps.filter(timestamp => {
        return new Date(timestamp).getDate() === now.getDate();
      }));
    }
    return timestampsSets;
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

  public getWeatherClosestToNoon(timestamps: string[]): CurrentWeather {
    let closestTime = timestamps.reduce((prev, curr) => {
      let currHour = parseInt(curr.split(' ')[1].split(':')[0], 10);
      let prevHour = parseInt(prev.split(' ')[1].split(':')[0], 10);
      return (Math.abs(currHour - 12) < Math.abs(prevHour - 12) ? curr : prev);
    });

    return {
      ...this.weather.weatherData[closestTime],
      timestamp: closestTime.substring(11, 16)
    };
  }

  // return a weather object for the timestamps starting with a copy of the original weather
  public getWeatherDataForDay(timestamps: string[]): WeatherData {
    const weatherDataForDay: WeatherData = { ...this.weather };
    weatherDataForDay.weatherData = timestamps.reduce((filteredData, timestamp) => {
      filteredData[timestamp] = this.weather.weatherData[timestamp];
      return filteredData;
    }, {} as Record<string, any>);
  
    return weatherDataForDay;
  }

}