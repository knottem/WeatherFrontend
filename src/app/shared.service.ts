import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Preferences } from '@capacitor/preferences';
import { SplashScreen } from '@capacitor/splash-screen';
import { Capacitor } from "@capacitor/core";
import { ScreenBrightness } from "@capacitor-community/screen-brightness";
import { City } from "../models/city";

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  // Updated time variables for footer
  private updatedTimeSource: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public updatedTime$: Observable<string> = this.updatedTimeSource.asObservable();

  // Search query variables
  private searchQuerySubject: BehaviorSubject<string> = new BehaviorSubject<string>('');

  weatherSourcesSource = new BehaviorSubject<string[]>([]);
  public weatherSources$ = this.weatherSourcesSource.asObservable();

  private darkModeSubject = new BehaviorSubject<boolean>(this.loadDarkModeFromStorage());
  public darkMode$ = this.darkModeSubject.asObservable();


  // Local storage variables
  private CURRENT_VERSION = '1.0.1';
  private STORAGE_KEY = 'weatherData';
  private SETTINGS_STORAGE_KEY = "userSettings";
  private CURRENT_SETTINGS_VERSION = "1.0.1"
  private LAST_SEARCHED_KEY = 'lastSearched';
  private FAVORITE_CITIES_KEY = 'favoriteCities';
  private CITY_LIST_KEY = 'cityList';

  private DEFAULT_SETTINGS = {
    darkMode: "off",
    language: "en",
    apis: this.getDefaultSortedApis(),
    brightness: 100
  };

  constructor() { }

  async initializeApp(): Promise<void> {
    return new Promise(async (resolve) => {
      const settings = this.loadUserSettings();
      const isDarkMode = settings.darkMode === "on";
      this.darkModeSubject.next(isDarkMode);

      await this.setAndroidStatusBar(isDarkMode);

      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      await SplashScreen.hide();
      resolve();
    });
  }

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

  saveBrightnessSetting(level: number): void {
    const settings = JSON.parse(localStorage.getItem(this.SETTINGS_STORAGE_KEY) || '{}');
    settings.brightness = level;

    // Ensure to keep the version and other existing settings
    const settingsWithVersion = {
      ...settings,
      version: this.CURRENT_SETTINGS_VERSION,
    };

    localStorage.setItem(this.SETTINGS_STORAGE_KEY, JSON.stringify(settingsWithVersion));
  }

  async setBrightnessSetting(level: number): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      const brightness = level / 100
      await ScreenBrightness.setBrightness({ brightness });
    } else {
      const adjustedLevel = 70 + (level * 0.3);
      const appElement = document.getElementById('app-root');
      if (appElement) {
        appElement.style.filter = `brightness(${adjustedLevel}%)`;
      }
    }
    this.saveBrightnessSetting(level)
  }

  loadUserSettings(): any {
    const data = JSON.parse(localStorage.getItem(this.SETTINGS_STORAGE_KEY) || "{}");
    if (data && data.version === this.CURRENT_SETTINGS_VERSION) {
      return data;
    }

    // Clean up old or incompatible data if we didn't load any correct data.
    localStorage.removeItem(this.SETTINGS_STORAGE_KEY);

    // Return default settings if no settings were found and save them to localStorage
    const settings = this.DEFAULT_SETTINGS;
    this.saveUserSettings(settings);
    return settings;
  }

  loadDarkModeFromStorage(): boolean {
    const settings = this.loadUserSettings();
    return settings.darkMode === "on";
  }

  async setAndroidStatusBar(isDarkMode: boolean) {
    if(Capacitor.getPlatform() !== 'web') {
      if (isDarkMode) {
        await StatusBar.setBackgroundColor({color: '#303234'}); // Same color as header
        await StatusBar.setStyle({style: Style.Dark}); // Light icons for visibility on dark background
      } else {
        await StatusBar.setBackgroundColor({color: '#d9e9ea'}); // Same color as header
        await StatusBar.setStyle({style: Style.Light}); // Dark icons for visibility on light background
      }
    }
  }

  toggleDarkMode(): void {
    const currentMode = this.darkModeSubject.value;
    const newMode = !currentMode;

    // Update BehaviorSubject to notify subscribers
    this.darkModeSubject.next(newMode);

    Preferences.set({
      key: 'darkMode',
      value: JSON.stringify(newMode),
    });

    const settings = this.loadUserSettings();
    settings.darkMode = newMode ? "on" : "off";
    this.saveUserSettings(settings);

    // Synchronize the UI and status bar changes
    this.setAndroidStatusBar(newMode).then(() => {
      if (newMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    });
  }

  clearOldData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  getLastSearched(): City[] {
    const data = JSON.parse(localStorage.getItem(this.LAST_SEARCHED_KEY) || "{}");
    if (data && data.version === this.CURRENT_VERSION) {
      return data.items || [];
    }
    localStorage.removeItem(this.LAST_SEARCHED_KEY);
    return [];
  }

  setLastSearched(cities: City[]): void {
    const data = {
      version: this.CURRENT_VERSION,
      items: cities
    };
    localStorage.setItem(this.LAST_SEARCHED_KEY, JSON.stringify(data));
  }

  getFavoriteCities(): City[] {
    const data = JSON.parse(localStorage.getItem(this.FAVORITE_CITIES_KEY) || "{}");
    if (data && data.version === this.CURRENT_VERSION) {
      return data.items || [];
    }
    localStorage.removeItem(this.FAVORITE_CITIES_KEY);

    return [];
  }

  setFavoriteCities(cities: City[]): void {
    const data = {
      version: this.CURRENT_VERSION,
      items: cities
    };
    localStorage.setItem(this.FAVORITE_CITIES_KEY, JSON.stringify(data));
  }

  setCityList(cities: City[]): void {
    const data = {
      time: new Date().getTime(),
      items: cities,
      version: this.CURRENT_VERSION,
    };
    localStorage.setItem(this.CITY_LIST_KEY, JSON.stringify(data));
  }

  getCityList(): City[] | null {
    const data = localStorage.getItem(this.CITY_LIST_KEY);
    const currentTime = new Date().getTime();
    if (data) {
      const parsedData = JSON.parse(data);
      if (parsedData.version === this.CURRENT_VERSION && parsedData.items) {
        const cities = parsedData.items;
        const time = parsedData.time;
        if (time && currentTime - time < 1800000) { // 30 minutes
          return cities; // Return cached data
        }
      }
      localStorage.removeItem(this.CITY_LIST_KEY);
    }
    return null; // Return null to indicate cache miss
  }

  getPreviousApis(): string[] {
    const apis = sessionStorage.getItem('previousApis');
    return apis ? this.sortApis(JSON.parse(apis)) : this.getDefaultSortedApis();
  }

  getSelectedApis(): string[] {
    const userSettings = this.loadUserSettings();
    // Ensure APIs exist and default if necessary
    return this.sortApis(Array.isArray(userSettings?.apis) ? userSettings.apis : this.getDefaultSortedApis());
  }

  storePreviousApis(apis: string[]) {
    sessionStorage.setItem('previousApis', JSON.stringify(apis));
  }

  sortApis(apis: string[]): string[] {
    return apis.sort((a, b) => a.localeCompare(b));
  }

  getDefaultSortedApis(): string[] {
    return this.sortApis(["yr", "fmi", "smhi"]);
  }

}
