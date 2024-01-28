import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { catchError, delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  private CURRENT_VERSION = '1.0.1';
  private STORAGE_KEY = 'weatherData';

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
    // Day icons
    1: './assets/images/weathericons/01d.svg', // clear sky
    2: './assets/images/weathericons/02d.svg', // nearly clear sky
    3: './assets/images/weathericons/02d.svg', // variable cloudiness
    4: './assets/images/weathericons/03d.svg', // halfclear sky
    5: './assets/images/weathericons/03d.svg', // cloudy sky
    6: './assets/images/weathericons/04.svg',
    7: './assets/images/weathericons/15.svg',
    8: './assets/images/weathericons/40d.svg',
    9: './assets/images/weathericons/05d.svg',
    10: './assets/images/weathericons/41d.svg',
    11: './assets/images/weathericons/11.svg', // thunderstorm - not really accurate picture
    12: './assets/images/weathericons/42d.svg',
    13: './assets/images/weathericons/07d.svg',
    14: './assets/images/weathericons/43d.svg',
    15: './assets/images/weathericons/44d.svg',
    16: './assets/images/weathericons/49.svg',
    17: './assets/images/weathericons/45d.svg',
    18: './assets/images/weathericons/46.svg',
    19: './assets/images/weathericons/09.svg',
    20: './assets/images/weathericons/10.svg',
    21: './assets/images/weathericons/33.svg', // thunder - not really accurate picture
    22: './assets/images/weathericons/47.svg',
    23: './assets/images/weathericons/12.svg',
    25: './assets/images/weathericons/44d.svg',
    26: './assets/images/weathericons/49.svg',
    27: './assets/images/weathericons/50.svg',
    // Night icons - add 27 to the code
    28: './assets/images/weathericons/01n.svg', // clear sky
    29: './assets/images/weathericons/02n.svg', // nearly clear sky
    30: './assets/images/weathericons/02n.svg', // variable cloudiness
    31: './assets/images/weathericons/03n.svg', // halfclear sky
    32: './assets/images/weathericons/03n.svg', // cloudy sky
    33: './assets/images/weathericons/04.svg',
    34: './assets/images/weathericons/15.svg',
    35: './assets/images/weathericons/40n.svg',
    36: './assets/images/weathericons/05n.svg',
    37: './assets/images/weathericons/41n.svg',
    38: './assets/images/weathericons/11.svg', // thunderstorm - not really accurate picture
    39: './assets/images/weathericons/42n.svg',
    40: './assets/images/weathericons/07n.svg',
    41: './assets/images/weathericons/43n.svg',
    42: './assets/images/weathericons/44n.svg',
    43: './assets/images/weathericons/49.svg',
    44: './assets/images/weathericons/45n.svg',
    45: './assets/images/weathericons/46.svg',
    46: './assets/images/weathericons/09.svg',
    47: './assets/images/weathericons/10.svg',
    48: './assets/images/weathericons/33.svg', // thunder - not really accurate picture
    49: './assets/images/weathericons/47.svg',
    50: './assets/images/weathericons/12.svg',
    51: './assets/images/weathericons/44n.svg',
    52: './assets/images/weathericons/49.svg',
    53: './assets/images/weathericons/50.svg',
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

  getWeatherConditionImage(code: number, day: boolean): string {
    if(!day){
      code += 27;
    }
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

  saveWeatherData(data: any): void {
    const dataWithVersion = { ...data, version: this.CURRENT_VERSION };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(dataWithVersion));
  }
  
  loadWeatherData(): any {
    //remove old data
    localStorage.removeItem("weather");

    const data = JSON.parse(localStorage.getItem(this.STORAGE_KEY) as string);
    if (data && data.version === this.CURRENT_VERSION) {
      return data;
    }
    localStorage.removeItem(this.STORAGE_KEY);
    return null;
  }
  
  clearOldData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
  
}                                                                                 