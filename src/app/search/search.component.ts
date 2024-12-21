import { Component, OnInit } from '@angular/core';
import { WeatherService } from '../weather.service';
import {Observable, of, Subscription} from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SharedService } from '../shared.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { IonicModule } from "@ionic/angular";
import { FormsModule } from "@angular/forms";
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from "@angular/cdk/drag-drop";
import {City} from "../../models/city";

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    TranslateModule,
    CdkDropList,
    CdkDrag
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent implements OnInit {

  public searchQuery: string = '';
  public cityList: City[] = [];
  public filteredCities: Observable<City[]> = of([]);
  public favoriteCities: City[] = [];
  public lastSearched: City[] = [];
  public isDarkMode: boolean = false;
  public isLimited: boolean = false;
  public totalResults: number = 0;

  private cityListSubscription!: Subscription;

  constructor(
    public sharedService: SharedService,
    private router: Router,
    public translate: TranslateService,
    private weatherService: WeatherService
  ) {
    this.sharedService.darkMode$.subscribe((isDark) => {
      this.isDarkMode = isDark;
    });
  }

  ngOnInit() {
    this.loadSavedData();
    this.loadCityList();

  }

  ngOnDestroy() {
    // Unsubscribe from the subscription to prevent memory leaks
    if (this.cityListSubscription) {
      this.cityListSubscription.unsubscribe();
    }
  }

  private loadCityList() {
    this.cityListSubscription = this.weatherService.getCityList().subscribe((data: City[]) => {
      this.cityList = data;
    });
  }

  private loadSavedData() {
    this.favoriteCities = this.sharedService.getFavoriteCities();
    this.lastSearched = this.sharedService.getLastSearched()
      .filter(city => !this.favoriteCities.some(fav => fav.name === city.name));
  }

  // list of 3 last searched cities that are not in favorites list, so we need to filter out the favorites before returning
  public lastSearchedCities(): City[] {
    return this.lastSearched.filter(city => !this.favoriteCities.includes(city)).slice(-3).reverse();
  }

  toggleFavorite(city: City) {
    const index = this.favoriteCities.indexOf(city);
    if (index > -1) {
      this.favoriteCities.splice(index, 1);
    } else {
      this.favoriteCities.push(city);
    }
    this.sharedService.setFavoriteCities(this.favoriteCities);
  }

  isFavorite(city: City): boolean {
    return this.favoriteCities.includes(city);
  }

  onCancel() {
    this.router.navigate(['/']); // Navigate back to the previous page
  }

  private _filter(query: string): City[] {
    if (!query) {
      return [...this.lastSearched].reverse(); // Show recently searched if the query is empty
    }

    const lowerQuery = query.toLowerCase();

    // Use map and filter in a streamlined way
    const matchingCities = this.cityList
      .map(city => this.addTransliteratedNameIfNeeded(city, lowerQuery)) // Add transliteration dynamically
      .filter(city => this.doesCityMatch(city, lowerQuery)); // Filter matching cities

    this.totalResults = matchingCities.length;
    this.isLimited = matchingCities.length > 50;
    return matchingCities.slice(0, 50); // Limit to the first 50 results
  }

  private addTransliteratedNameIfNeeded(city: City, query: string): City {
    if (!city.en) {
      const transliterated = this.transliterateToEnglish(city.name);
      if (transliterated.toLowerCase().includes(query)) {
        return { ...city, en: transliterated }; // Add 'en' dynamically if it matches the query
      }
    }
    return city;
  }

  private doesCityMatch(city: City, query: string): boolean {
    const lowerQuery = query.toLowerCase();

    // Check if the query matches the original name
    const nameMatches = city.name.toLowerCase().includes(lowerQuery);

    // Check if the query matches the transliterated name and requires transliteration
    const enMatches = city.en
      ? city.en.toLowerCase().includes(lowerQuery)
      : this.transliterateToEnglish(city.name).toLowerCase().includes(lowerQuery);

    return nameMatches || enMatches;
  }

  public onSearchInput(event: any) {
    const query = event.target.value.toLowerCase();
    if (query.length > 0) {
      this.filteredCities = of(this._filter(query)); // Apply multi-language search
    } else {
      this.filteredCities = of([]); // Clear search results if query is empty
    }
  }

  public onCitySelected(city: City) {
    if (city) {
      this.updateSearchQuery(city);
    }
    this.resetSearchQuery();
  }

  public onEnterPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      const currentValue = this.searchQuery.toLowerCase().trim();
      const matchingCities = this._filter(currentValue);

      if (matchingCities.length === 1) {
        this.updateSearchQuery(matchingCities[0]);
        this.resetSearchQuery();
      }
    }
  }

  public updateSearchQuery(city: City) {
    const matchingCity = this.cityList.find(c => c.name === city.name);
    if (matchingCity) {
      this.addCityToLastSearched(matchingCity);
      this.sharedService.setSearchQuery(matchingCity.name);
      this.router.navigate(['/']);
    }
  }

  private resetSearchQuery() {
    this.searchQuery = '';
    this.filteredCities = of([]);
  }

  private addCityToLastSearched(city: City) {
    const index = this.lastSearched.findIndex(search => search.name === city.name);
    if (index > -1) {
      this.lastSearched.splice(index, 1);
    }
    this.lastSearched.push(city);
    while (this.lastSearched.length > 10) {
      this.lastSearched.shift();
    }
    this.sharedService.setLastSearched(this.lastSearched);
  }

  onKeyPressCity(event: KeyboardEvent, city: City) {
    if (event.key === 'Enter' || event.key === ' ') {
      this.onCitySelected(city);
    }
  }

  onKeyPressFavorite(event: KeyboardEvent, city: City) {
    if (event.key === 'Enter' || event.key === ' ') {
      this.toggleFavorite(city);
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.favoriteCities, event.previousIndex, event.currentIndex);
    this.sharedService.setFavoriteCities(this.favoriteCities);
  }

  transliterateToEnglish(name: string): string {
    if (!name) return '';

    // Map Swedish characters to English equivalents
    const transliterationMap: { [key: string]: string } = {
      å: 'a', ä: 'a', ö: 'o',
      Å: 'A', Ä: 'A', Ö: 'O'
    };

    // Replace characters using the map
    return name.replace(/[åäöÅÄÖ]/g, char => transliterationMap[char] || char);
  }

}
