import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { catchError, delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

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

  constructor(private http: HttpClient) {}

  getWeather(city: string): Observable<any> { 
      return this.http.get<any>(`${environment.apiUrl}/weather/${city}`);
  }

  getCityList(): Observable<string[]> {
      return this.http.get<any>(`${environment.apiUrl}/city/names`).pipe(
        catchError(error => {
          console.error('Error loading city list from API:', error);
          return this.loadCityListFromAssets();
        })
      );
  }

  getWeatherCondition(code: number): string {
    return this.weatherConditions[code] || 'Unknown condition';
  }

  loadCityListFromAssets(): Observable<string[]> {
    return this.http.get<any>('assets/cityNames.json').pipe(
      catchError(assetsError => {
        console.error('Error loading city list from assets:', assetsError);
        return of([]);
      })
    );
  }
}                                                                                 