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

  // Local storage variables
  private CURRENT_VERSION = '1.0.1';
  private STORAGE_KEY = 'weatherData';

  constructor() { }

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
  
  clearOldData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

}
