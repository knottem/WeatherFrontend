import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
  private headers = new HttpHeaders({ 'Authorization': environment.Auth });
  
  public cityList: string[] = [];

  constructor(private http: HttpClient) { }

  getWeather(city: string): Observable<any> {
    if (this.mockAPi) {
      console.log("Using mock API");
      return this.http.get<any>('assets/stockholm.json').pipe(
        map(data => {
          // Adjust dates in the response to match today, tomorrow, etc.
          return this.adjustDatesInMockData(data);
        })
      );
    } else {
      return this.http.get<any>(`${this.baseUrl}/weather/merged/${city}`, { headers: this.headers });
    }
  }

  getCityList(): Observable<string[]> {
    return this.http.get<any>(`${this.baseUrl}/city/names`, { headers: this.headers });
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
}                                                                                 