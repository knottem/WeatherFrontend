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

  private weatherImagesDay: { [key: number]: string } = {
    1: './assets/images/lightmode/01d.svg', // clear sky
    2: './assets/images/lightmode/02d.svg', // nearly clear sky
    3: './assets/images/lightmode/02d.svg', // variable cloudiness
    4: './assets/images/lightmode/03d.svg', // halfclear sky
    5: './assets/images/lightmode/03d.svg', // cloudy sky
    6: './assets/images/lightmode/04.svg',
    7: './assets/images/lightmode/15.svg',
    8: './assets/images/lightmode/40d.svg',
    9: './assets/images/lightmode/05d.svg',
    10: './assets/images/lightmode/41d.svg',
    11: './assets/images/lightmode/11.svg', // thunderstorm - not really accurate picture
    12: './assets/images/lightmode/42d.svg',
    13: './assets/images/lightmode/07d.svg',
    14: './assets/images/lightmode/43d.svg',
    15: './assets/images/lightmode/44d.svg',
    16: './assets/images/lightmode/49.svg',
    17: './assets/images/lightmode/45d.svg',
    18: './assets/images/lightmode/46.svg',
    19: './assets/images/lightmode/09.svg',
    20: './assets/images/lightmode/10.svg',
    21: './assets/images/lightmode/33.svg', // thunder - not really accurate picture
    22: './assets/images/lightmode/47.svg',
    23: './assets/images/lightmode/12.svg',
    25: './assets/images/lightmode/44d.svg',
    26: './assets/images/lightmode/49.svg',
    27: './assets/images/lightmode/50.svg'
  }

  constructor(private http: HttpClient) {}

  getWeather(city: string): Observable<any> { 
      return this.http.get<any>(`${environment.apiUrl}/weather/${city}`).pipe(
        //delay(1000)
      );
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

  getWeatherConditionImage(code: number): string {
    if(this.weatherImagesDay[code] === undefined){
      console.log('Unknown condition image', code);
    }
    return this.weatherImagesDay[code];
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