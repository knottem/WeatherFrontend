import {ChangeDetectorRef, Component} from '@angular/core';
import {CurrentWeather, WeatherData} from '../../models/weather-data';
import {WeatherService} from '../weather.service';
import {SharedService} from '../shared.service';
import {DateTime} from 'luxon';
import {CommonModule} from '@angular/common';
import {LoadingIndicatorComponent} from '../loading-indicator/loading-indicator.component';
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {BehaviorSubject, Subscription} from "rxjs";
import {WeatherUtilsService} from "../weather-utils.service";

@Component({
  selector: 'app-weather-display',
  templateUrl: './weather-display.component.html',
  styleUrls: ['./weather-display.component.css'],
  standalone: true,
  imports: [CommonModule, LoadingIndicatorComponent, TranslateModule],
})
export class WeatherDisplayComponent {

  private defaultCity: string = 'stockholm';
  private currentCity: string = '';

  public amountOfDays: number = 10;

  private imageCache = new Map<string, string>();

  public weather: WeatherData = new WeatherData();
  public currentWeather: CurrentWeather = new CurrentWeather('', 0, 0, 0, 0, 0);
  public currentDays: string[] = [];
  public currentDates: string[] = [];
  public timestamps: string[][] = [];
  public updatedTime: string = '';
  public translatedSources: string = '';

  public isLoaded: boolean = false;

  private timeSubscription!: Subscription;
  private sourcesSubscription!: Subscription;
  private weatherSubscription!: Subscription;


  // Arrays to store weather data for the next 10 days
  public allWeatherData: WeatherData[] = [];
  public allSunsetSunriseData: string[][] = [];
  public expandedDayIndex: number | null = null;
  public highTempPerDay: number[] = [];
  public lowTempPerDay: number[] = [];
  public nightWeather: number[] = [];
  public dayWeather: number[] = [];
  public totalPrecipitationPerDay: number[] = [];


  public isMobile$ = new BehaviorSubject<boolean>(this.checkIsMobile());

  constructor(
    private weatherService: WeatherService,
    private translate: TranslateService,
    private sharedService: SharedService,
    private cdr: ChangeDetectorRef,
    private weatherUtilsService: WeatherUtilsService
  ) {}

  ngOnInit() {
    // Load the current city from the local storage
    const data = this.sharedService.loadWeatherData();
    if (data !== null) {
      this.currentCity = data.city.name;
    } else {
      this.currentCity = sessionStorage.getItem('currentCity') || this.defaultCity;
    }

    // Fetch the weather data
    this.handleWeatherLoading();

    this.timeSubscription = this.sharedService.updatedTime$
      .subscribe((time) => {
        this.updatedTime = time;
      });

    this.sourcesSubscription = this.sharedService.weatherSources$
      .subscribe((sources) => {
        this.updateTranslatedSources(sources);
      });

    window.addEventListener('resize', () => this.isMobile$.next(this.checkIsMobile()));
  }

  ngOnDestroy() {
    if (this.timeSubscription) {
      this.timeSubscription.unsubscribe();
    }
    if (this.sourcesSubscription) {
      this.sourcesSubscription.unsubscribe();
    }
    if (this.weatherSubscription) {
      this.weatherSubscription.unsubscribe();
    }
  }

  private handleWeatherLoading(): void {
    const currentApis = this.getSelectedApis();
    const previousApis = this.getPreviousApis();
    const latestSearch = this.sharedService.getSearchQuery();

    // If APIs have changed or there is a new city from the search
    if (JSON.stringify(currentApis) !== JSON.stringify(previousApis) || (latestSearch && latestSearch !== this.currentCity)) {
      this.isLoaded = false;
      const cityToFetch = latestSearch && latestSearch !== this.currentCity ? latestSearch : this.currentCity;
      this.currentCity = cityToFetch;
      this.getWeather(cityToFetch);
    } else {
      // Fallback to initial weather data if the APIs or city haven't changed
      this.loadInitialWeatherData();
    }

    // Store the current APIs in sessionStorage for future comparison
    this.storePreviousApis(currentApis);
  }

  private getPreviousApis(): string[] {
    const apis = sessionStorage.getItem('previousApis');
    return apis !== undefined && apis !== null && apis !== '' && apis !== "undefined" ? JSON.parse(apis) : [];
  }

  private getSelectedApis(): string[] {
    return this.sharedService.loadUserSettings().apis;

  }

  private storePreviousApis(apis: string[]) {
    sessionStorage.setItem('previousApis', JSON.stringify(apis));
  }

  private areApisSame(): boolean {
    const previousApis = this.getPreviousApis();
    const currentApis = this.getSelectedApis();
    return JSON.stringify(previousApis) === JSON.stringify(currentApis);
  }

  private loadInitialWeatherData() {
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

  private async updateTranslatedSources(sources: string[]) {
    const formattedSources = await this.formatSources(sources);
    this.translate.get('footer.sources', { sourceList: formattedSources }).subscribe((res: string) => {
      this.translatedSources = res;
      this.cdr.detectChanges();
    });
  }

  private async formatSources(sources: string[]): Promise<string> {
    if (sources.length === 0) return '';
    if (sources.length === 1) return sources[0];

    const and = await this.translate.get('footer.and').toPromise();
    const allButLast = sources.slice(0, -1).join(', ');
    const last = sources[sources.length - 1];
    return `${allButLast} ${and} ${last}`;
  }

  private getWeather(str: string) {
    if (str === '') {
      console.error("getWeather called with an empty city string.");
      return;
    }

    this.isLoaded = false;
    this.cdr.detectChanges();

    const data = this.sharedService.loadWeatherData();
    if (data !== null && data.city.name.toLowerCase() === str.toLowerCase()) {
      const cachedTime = new Date(data.timestamp).getTime();
      const currentTime = new Date().getTime();
      const timeDifference = currentTime - cachedTime;
      if (this.areApisSame() && timeDifference < 60 * 60 * 1000) {
        this.processWeatherData(data);
        return;
      }
    }

    // Unsubscribe from the previous subscription just for safety
    if (this.weatherSubscription) {
      this.weatherSubscription.unsubscribe();
    }

    // Fetch new weather data from the api
    this.weatherSubscription = this.weatherService.getWeather(str).subscribe((data) => {
      this.storePreviousApis(this.getSelectedApis());
      this.processWeatherData(data);
    });
  }

  private processWeatherData(data: any): void {
    const copy = JSON.parse(JSON.stringify(data)); // Deep copy
    this.weather = this.weatherUtilsService.convertToLocaleTime(copy);
    const availableTimestamps = this.filterTimestamps(
      Object.keys(this.weather.weatherData)
    );
    this.timestamps = this.weatherUtilsService.getTimeStamps(availableTimestamps);
    this.currentDays = this.weatherUtilsService.getDay();
    this.currentDates = this.weatherUtilsService.getDates();
    this.currentWeather = new CurrentWeather(
      availableTimestamps[0],
      this.weather.weatherData[availableTimestamps[0]].temperature,
      this.weather.weatherData[availableTimestamps[0]].weatherCode,
      this.weather.weatherData[availableTimestamps[0]].windSpeed,
      this.weather.weatherData[availableTimestamps[0]].windDirection,
      this.weather.weatherData[availableTimestamps[0]].precipitation
    );
    this.prepareWeatherData();
    this.sharedService.setUpdatedTime(this.weather.timestamp.substring(11, 16));
    this.sharedService.setWeatherSources(this.extractSources(this.weather.message));

    if (this.weather.message !== 'Mock data') {
      this.sharedService.saveWeatherData(data);
    }
    document.title = `${this.weather.city.name} - Weather`;
    this.isLoaded = true;
    this.cdr.detectChanges();
  }

// Return a list of timestamps that are later than the current hour and on the same day
  public filterTimestamps(timestamps: string[]): string[] {
    const now = new Date();
    return timestamps.filter((timestamp) => {
      const timestampDate = new Date(timestamp);
      return (
        timestampDate.toDateString() === now.toDateString() &&
        timestampDate.getHours() >= now.getHours() ||
        timestampDate > now
      );
    });
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
    if (!this.imageCache.has(cacheKey)) {
      const image = this.weatherService.getWeatherConditionImage(code, day);
      this.imageCache.set(cacheKey, image);
      return image;
    }
    return this.imageCache.get(cacheKey) as string;
  }


  // should return a boolean depending on timestamp and sunrise/sunset
  public isDayTime(timestamp: string, dayIndex: number): boolean {
    const sunriseHour = parseInt(this.allSunsetSunriseData[dayIndex][0].substring(11, 13));
    const sunsetHour = parseInt(this.allSunsetSunriseData[dayIndex][1].substring(11, 13));
    const hour = parseInt(timestamp.substring(11, 13));
    return hour >= sunriseHour && hour <= sunsetHour;
  }

  public getSunsetSunrise(index: number): string[] {
    return [this.weather.city.sunriseList[index], this.weather.city.sunsetList[index]];
  }

  private extractSources(message: string): string[] {
    const match = message.match(/from (.*)/);
    if (match && match[1]) {
      const sourcesString = match[1].trim();
      return sourcesString.split(/,| and /).map(source => source.trim());
    }
    return [];
  }

  public prepareWeatherData() {
    this.allWeatherData = [];
    this.allSunsetSunriseData = [];
    for (let i = 0; i < this.amountOfDays; i++) {
      this.allWeatherData.push(this.getWeatherDataForDay(this.timestamps[i]));
      this.allSunsetSunriseData.push(this.getSunsetSunrise(i));
    }

    this.allWeatherData.forEach((day, i) => {
      const timestamps = Object.keys(day.weatherData);
      const temps = timestamps.map(ts => day.weatherData[ts].temperature);

      // High and low temperatures for the day, rounded to the nearest integer
      this.highTempPerDay[i] = Math.round(Math.max(...temps));
      this.lowTempPerDay[i] = Math.round(Math.min(...temps));

      // Total precipitation for the day, rounded to one decimal place
      let totalPrecipitation = timestamps.reduce((total, ts) => total + day.weatherData[ts].precipitation, 0);
      this.totalPrecipitationPerDay[i] = Math.round(totalPrecipitation * 10) / 10;

      // Processes wind speeds to remove decimals for mobile if the windspeed is below 10 and keeps full windspeed for desktop
      timestamps.forEach(ts => {
        let windSpeed = day.weatherData[ts].windSpeed;
        day.weatherData[ts].fullWindSpeed = windSpeed;
        if (windSpeed >= 10) {
          day.weatherData[ts].windSpeed = Math.round(windSpeed);
        }
      });

      // Get the previous day's timestamps, if available
      const previousDayTimestamps = i > 0 ? Object.keys(this.allWeatherData[i - 1].weatherData) : [];

      // Night weather: previous day's night (18:00-23:59) + current day's early morning (00:00-05:59)
      const previousNightTimes = previousDayTimestamps.filter(ts => {
        const hour = parseInt(ts.substring(11, 13), 10);
        return hour >= 18; // Previous day's night (18:00 - 23:59)
      });
      const earlyMorningTimes = timestamps.filter(ts => {
        const hour = parseInt(ts.substring(11, 13), 10);
        return hour < 6; // Current day's early morning (00:00 - 05:59)
      });

      const nightTimes = [...previousNightTimes, ...earlyMorningTimes];

      // Assign the night weather condition based on the previous night
      this.nightWeather[i] = this.getMostCommonWeatherCode(nightTimes, day) || -1;

      // Day weather: current day's times between 06:00 and 17:59
      const dayTimes = timestamps.filter(ts => {
        const hour = parseInt(ts.substring(11, 13), 10);
        return hour >= 6 && hour < 18; // Daytime hours (06:00 - 17:59)
      });

      // Assign the day weather condition based on the current day
      this.dayWeather[i] = this.getMostCommonWeatherCode(dayTimes, day) || -1;


    });

    this.cdr.detectChanges();
  }

  toggleDayMobile(index: number): void {
    if(window.innerWidth < 768) {
      this.toggleDay(index);
    }
  }

  toggleDay(index: number): void {
    this.expandedDayIndex = this.expandedDayIndex === index ? null : index;
  }

  getHourlyTimestamps(dayIndex: number): string[] {
    return Object.keys(this.allWeatherData[dayIndex].weatherData);  // Return all timestamps (hours) for the specific day
  }

  getMostCommonWeatherCode(timestamps: string[], day: WeatherData): number {
    if (timestamps.length === 0) {
      return -1; // Return a default value if the array is empty
    }
    const codeMap = new Map<number, number>();

    timestamps.forEach(ts => {
      const weatherDataEntry = day.weatherData[ts];
      // Check if the weather data exists for this timestamp
      if (weatherDataEntry && weatherDataEntry.weatherCode !== undefined) {
        const code = weatherDataEntry.weatherCode;
        codeMap.set(code, (codeMap.get(code) || 0) + 1);
      }
    });

    // Return the most common weather code
    return Array.from(codeMap).reduce((prev, curr) => curr[1] > prev[1] ? curr : prev)[0];
  }

  checkIsMobile(): boolean {
    return window.innerWidth <= 768;
  }

}
