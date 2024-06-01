import { Component, OnInit } from '@angular/core';
import { WeatherService } from '../weather.service';
import { Observable, of, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SharedService } from '../shared.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { IonicModule, Platform } from "@ionic/angular";
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    TranslateModule
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent implements OnInit {

  private readonly LAST_SEARCHED_KEY = 'lastSearched';
  private readonly FAVORITE_CITIES_KEY = 'favoriteCities';

  public searchQuery: string = '';
  public cityList: string[] = [];
  public filteredCities: Observable<string[]> = of([]);
  public lastSearched: string[] = [];
  public favoriteCities: string[] = [];
  private subscriptions: Subscription = new Subscription();

  constructor(
    public sharedService: SharedService,
    private weatherService: WeatherService,
    private router: Router,
    private platform: Platform,
    public translate: TranslateService
  ) {
  }

  ngOnInit() {
    this.getCityList();
    this.loadLastSearched();
    this.loadFavoriteCities();
    this.addKeyboardListeners();
  }

  ngOnDestroy() {
    this.removeKeyboardListeners();
  }

  private loadLastSearched() {
    const item = localStorage.getItem(this.LAST_SEARCHED_KEY);
    this.lastSearched = item ? JSON.parse(item) : [];
    this.lastSearched = this.lastSearched.filter(city => !this.favoriteCities.includes(city));
  }

  private loadFavoriteCities() {
    const favorites = localStorage.getItem(this.FAVORITE_CITIES_KEY);
    this.favoriteCities = favorites ? JSON.parse(favorites) : [];
  }

  // list of 3 last searched cities that are not in favorites list so we need to filter out the favorites before returning
  public lastSearchedCities(): string[] {
    return this.lastSearched.filter(city => !this.favoriteCities.includes(city)).slice(-3).reverse();
  }

  toggleFavorite(city: string) {
    const index = this.favoriteCities.indexOf(city);
    if (index > -1) {
      this.favoriteCities.splice(index, 1);
    } else {
      this.favoriteCities.push(city);
      // Remove from last searched if it's being added to favorites
      const lastSearchedIndex = this.lastSearched.indexOf(city);
      if (lastSearchedIndex > -1) {
        this.lastSearched.splice(lastSearchedIndex, 1);
        localStorage.setItem('lastSearched', JSON.stringify(this.lastSearched));
      }
    }
    localStorage.setItem('favoriteCities', JSON.stringify(this.favoriteCities));
  }

  isFavorite(city: string): boolean {
    return this.favoriteCities.includes(city);
  }

  addKeyboardListeners() {
    this.subscriptions.add(
      this.platform.keyboardDidShow.subscribe(ev => {
        this.onKeyboardShow(ev);
      })
    );
    this.subscriptions.add(
      this.platform.keyboardDidHide.subscribe(() => {
        this.onKeyboardHide();
      })
    );
  }

  removeKeyboardListeners() {
    this.subscriptions.unsubscribe();
  }

  onKeyboardShow(ev: any) {
    const {keyboardHeight} = ev;
    const searchResults = document.getElementById('search-results');
    if (searchResults) {
      searchResults.style.maxHeight = `calc(80vh - ${keyboardHeight}px - 50px)` // 50px is for "suggestions" above the keyboard
    }
  }

  onKeyboardHide() {
    const searchResults = document.getElementById('search-results');
    if (searchResults) {
      searchResults.style.maxHeight = '80%';
    }
  }


  onCancel() {
    this.router.navigate(['/']); // Navigate back to the previous page
  }

  private _filter(value: string): string[] {
    if (value.length < 1) {
      return [...this.lastSearched].reverse();
    }
    return this.cityList.filter(city => city.toLowerCase().includes(value.toLowerCase()));
  }

  public onSearchInput(event: any) {
    const query = event.target.value.toLowerCase();
    if (query.length > 0) {
      this.filteredCities = of(this._filter(query));
    } else {
      this.filteredCities = of([]);
    }
  }

  public onCitySelected(city: string) {
    if (city) {
      this.updateSearchQuery(city);
    }
    this.resetSearchQuery();
  }

  public onEnterPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      const currentValue = this.searchQuery.toLowerCase();
      const matchingCities = this.cityList.filter(city =>
        city.toLowerCase().includes(currentValue)
      );
      if (matchingCities.length === 1 || this.cityList.map(c => c.toLowerCase()).includes(currentValue)) {
        this.updateSearchQuery(matchingCities.length === 1 ? matchingCities[0] : currentValue);
      }
      this.resetSearchQuery();
    }
  }

  public updateSearchQuery(city: string) {
    if (this.cityList.includes(city)) {
      this.addCityToLastSearched(city);
      this.sharedService.setSearchQuery(city);
      this.router.navigate(['/']);
    }
  }

  private resetSearchQuery() {
    this.searchQuery = '';
    this.filteredCities = of([]);
  }

  private addCityToLastSearched(city: string) {
    const index = this.lastSearched.indexOf(city);
    if (index > -1) {
      this.lastSearched.splice(index, 1);
    }
    this.lastSearched.push(city);
    while (this.lastSearched.length > 10) {
      this.lastSearched.shift();
    }
    localStorage.setItem('lastSearched', JSON.stringify(this.lastSearched));
  }

  private getCityList() {
    const cityList = localStorage.getItem('cityList');
    let fetchNew = true;
    if (cityList) {
      const {time, cityList: cities} = JSON.parse(cityList);
      if (new Date().getTime() - time < 1800000) {
        this.cityList = cities;
        fetchNew = false;
      }
    }

    if (fetchNew) {
      this.weatherService.getCityList().subscribe((data: string[]) => {
        this.cityList = data;
        const time = new Date().getTime();
        localStorage.setItem('cityList', JSON.stringify({time, cityList: this.cityList}));
      });
    }
  }

  onKeyPressCity(event: KeyboardEvent, city: string) {
    if (event.key === 'Enter' || event.key === ' ') {
      this.onCitySelected(city);
    }
  }

  onKeyPressFavorite(event: KeyboardEvent, city: string) {
    if (event.key === 'Enter' || event.key === ' ') {
      this.toggleFavorite(city);
    }
  }

}
