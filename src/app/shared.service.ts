import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Preferences } from '@capacitor/preferences';
import { SplashScreen } from '@capacitor/splash-screen';
import {Capacitor} from "@capacitor/core";

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

  private darkModeSubject = new BehaviorSubject<boolean>(this.loadDarkModeFromStorage());
  public darkMode$ = this.darkModeSubject.asObservable();


  // Local storage variables
  private CURRENT_VERSION = '1.0.1';
  private STORAGE_KEY = 'weatherData';
  private SETTINGS_STORAGE_KEY = "userSettings";
  private CURRENT_SETTINGS_VERSION = "1.0.1"

  constructor() { }

  async initializeApp(): Promise<void> {
    return new Promise(async (resolve) => {
      const settings = this.loadUserSettings();
      const isDarkMode = settings.darkMode === "on";
      this.darkModeSubject.next(isDarkMode);
      this.setAndroidStatusBar(isDarkMode)
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

  loadUserSettings(): any {
    // Remove old formats or outdated versions if needed
    const data = JSON.parse(localStorage.getItem(this.SETTINGS_STORAGE_KEY) || "{}");
    if (data && data.version === this.CURRENT_SETTINGS_VERSION) {
      return data;
    }

    // Clean up old or incompatible data if we didnt load any correct data.
    localStorage.removeItem(this.SETTINGS_STORAGE_KEY);
    return { darkMode: "off", language: "en" }; // Default settings
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

    // Update localStorage
    const settings = this.loadUserSettings();
    settings.darkMode = newMode ? "on" : "off";
    this.saveUserSettings(settings);

    // Apply dark mode class to the document
    if (newMode) {
      document.documentElement.classList.add('dark');
      this.setAndroidStatusBar(true);
    } else {
      document.documentElement.classList.remove('dark');
      this.setAndroidStatusBar(false)
    }
  }

  clearOldData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

}
