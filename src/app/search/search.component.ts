import { Component, OnInit } from '@angular/core';
import { WeatherService } from '../weather.service';
import { Observable, of, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SharedService } from '../shared.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { IonicModule, Platform } from "@ionic/angular";
import { FormsModule } from "@angular/forms";
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from "@angular/cdk/drag-drop";

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
    this.loadSavedData();
  }

  private loadSavedData() {
    const favorites = localStorage.getItem(this.FAVORITE_CITIES_KEY);
    this.favoriteCities = favorites ? JSON.parse(favorites) : [];

    const searched = localStorage.getItem(this.LAST_SEARCHED_KEY);
    this.lastSearched = searched ? JSON.parse(searched) : [];

    this.lastSearched = this.lastSearched.filter(city => !this.favoriteCities.includes(city));
  }



  // list of 3 last searched cities that are not in favorites list, so we need to filter out the favorites before returning
  public lastSearchedCities(): string[] {
    return this.lastSearched.filter(city => !this.favoriteCities.includes(city)).slice(-3).reverse();
  }

  toggleFavorite(city: string) {
    const index = this.favoriteCities.indexOf(city);
    if (index > -1) {
      this.favoriteCities.splice(index, 1);
    } else {
      this.favoriteCities.push(city);
    }
    localStorage.setItem('favoriteCities', JSON.stringify(this.favoriteCities));
  }

  isFavorite(city: string): boolean {
    return this.favoriteCities.includes(city);
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

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.favoriteCities, event.previousIndex, event.currentIndex);
    localStorage.setItem('favoriteCities', JSON.stringify(this.favoriteCities));
  }

}
