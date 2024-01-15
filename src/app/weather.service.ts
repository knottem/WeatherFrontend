import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { DateTime } from 'luxon';
import { WeatherData } from 'src/models/weather-data';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  private mockAPi = false;

  private baseUrl = environment.apiUrl;
  
  public cityList: string[] = [];

  private weatherConditions: { [key: number]: string } = {
    1: 'Clear sky',
    2: 'Nearly clear sky',
    3: 'Variable cloudiness',
    4: 'Halfclear sky',
    5: 'Cloudy sky',
    6: 'Overcast',
    7: 'Fog',
    8: 'Light rain showers',
    9: 'Moderate rain showers',
    10: 'Heavy rain showers',
    11: 'Thunderstorm',
    12: 'Light sleet showers',
    13: 'Moderate sleet showers',
    14: 'Heavy sleet showers',
    15: 'Light snow showers',
    16: 'Moderate snow showers',
    17: 'Heavy snow showers',
    18: 'Light rain',
    19: 'Moderate rain',
    20: 'Heavy rain',
    21: 'Thunder',
    22: 'Light sleet',
    23: 'Moderate sleet',
    24: 'Heavy sleet',
    25: 'Light snowfall',
    26: 'Moderate snowfall',
    27: 'Heavy snowfall'
  }

  constructor(private http: HttpClient) { }

  getWeather(city: string): Observable<any> { 
    if (this.mockAPi) {
      console.log("Using mock API");
      return this.http.get<any>('assets/stockholm.json').pipe(
        map(data => {
          return this.adjustDatesInMockData(data);
        })
      );
    } else {
      return this.http.get<any>(`${this.baseUrl}/weather/${city}`);
    }
  }

  getCityList(): Observable<string[]> {
    if(this.mockAPi) {
      return this.http.get<any>('assets/cityNames.json');
    } else {
      return this.http.get<any>(`${this.baseUrl}/city/names`);
    }
  }


  adjustDatesInMockData(data: any): any {
    const currentDate = DateTime.local();
    const weatherData = data.weatherData;
    const adjustedWeatherData = new WeatherData().weatherData;

    const totalDifference = currentDate.diff(DateTime.fromISO(Object.keys(weatherData)[0]), ['days', 'hours']);

    for (const [key, value] of Object.entries(weatherData)) {
      const adjustedDate = DateTime.fromISO(key).plus(totalDifference).set({ minute: 0 });

      // Use toISO() to get the ISO string format of the date
      adjustedWeatherData[adjustedDate.toString()] = value as {
        temperature: number;
        weatherCode: number;
        windSpeed: number;
        windDirection: number;
        precipitation: number;
      };
    }
    
    data.timeStamp = new Date().toISOString();
    data.message = "Mock data";
    data.weatherData = adjustedWeatherData;
    return data;
  }

  getWeatherCondition(code: number): string {
    return this.weatherConditions[code] || 'Unknown condition';
  }
}                                                                                 