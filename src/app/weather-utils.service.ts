import { Injectable } from '@angular/core';
import {DateTime} from "luxon";
import {WeatherData} from "../models/weather-data";

@Injectable({
  providedIn: 'root'
})
export class WeatherUtilsService {

  private readonly numberOfDays = 10;
  private readonly cutoffHour = 23;

  constructor() { }

  // Converts all timestamps in the WeatherData object to local time
  convertToLocaleTime(weatherData: WeatherData): WeatherData {
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

    if (weatherDataCopy.city.sunriseList && weatherDataCopy.city.sunsetList) {
      for (let i = 0; i < weatherDataCopy.city.sunriseList.length; i++) {
        weatherDataCopy.city.sunriseList[i] = this.convertTimestampToLocaleTime(weatherDataCopy.city.sunriseList[i]);
        weatherDataCopy.city.sunsetList[i] = this.convertTimestampToLocaleTime(weatherDataCopy.city.sunsetList[i]);
      }
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

  // return a list of days starting with today, tomorrow and then the next 8 days as weekdays
  // if the current time is after 23:00, the first day will be tomorrow, otherwise today
  getDay(): string[] {
    const days: string[] = [];
    if (new Date().getHours() >= this.cutoffHour) {
      days.push('Tomorrow');
      for (let i = 2; i <this.numberOfDays + 1; i++) {
        days.push(DateTime.local().plus({ days: i }).toFormat('cccc'));
      }
    } else {
      days.push('Today');
      days.push('Tomorrow');
      for (let i = 2; i < this.numberOfDays; i++) {
        days.push(DateTime.local().plus({ days: i }).toFormat('cccc'));
      }
    }

    return days;
  }

  getDates(): string[] {
    const dates: string[] = [];
    for (let i = 0; i < 10; i++) {
      dates.push(DateTime.local().plus({ days: i }).toFormat('yyyy-MM-dd'));
    }
    return dates;
  }

  // return a list of timestamps for the next 10 days
  getTimeStamps(timestamps: string[]): string[][] {
    const timestampsSets: string[][] = [];
    let lasthour = false;
    if (new Date().getHours() >= 23) {
      lasthour = true;
    }
    for (let day = 0; day < this.numberOfDays; day++) {
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

}
