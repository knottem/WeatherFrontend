import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  // Updated time variables for footer
  private updatedTimeSource: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public updatedTime$: Observable<string> = this.updatedTimeSource.asObservable();

  // Search query variables
  private searchQuerySubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public searchQuery$: Observable<string> = this.searchQuerySubject.asObservable();

  weatherSourcesSource = new BehaviorSubject<string[]>([]);
  public weatherSources$ = this.weatherSourcesSource.asObservable();


  // Local storage variables
  private CURRENT_VERSION = '1.0.1';
  private STORAGE_KEY = 'weatherData';
  private SETTINGS_STORAGE_KEY = "userSettings";
  private CURRENT_SETTINGS_VERSION = "1.0.1"

  constructor() { }

  setWeatherSources(sources: string[]) {
    this.weatherSourcesSource.next(sources);
  }

  setUpdatedTime(time: string) {
    this.updatedTimeSource.next(time);
  }

  setSearchQuery(query: string) {
    this.searchQuerySubject.next(query.toLocaleLowerCase());
  }

  getSearchQuery(): string {
    return this.searchQuerySubject.value;
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

  saveUserSettings(settings: any): void {
    const settingsWithVersion = { ...settings, version: this.CURRENT_SETTINGS_VERSION };
    localStorage.setItem(this.SETTINGS_STORAGE_KEY, JSON.stringify(settingsWithVersion));
  }

  loadUserSettings(): any {
    // Remove old formats or outdated versions if needed
    const data = JSON.parse(localStorage.getItem(this.SETTINGS_STORAGE_KEY) || "{}");

    if (data && data.version === this.CURRENT_SETTINGS_VERSION) {
      return data;
    }

    // Clean up old or incompatible data
    localStorage.removeItem(this.SETTINGS_STORAGE_KEY);
    return { darkMode: "off", language: "en" }; // Default settings
  }

  clearOldData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

}
