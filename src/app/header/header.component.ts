import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { WeatherService } from '../weather.service';
import { Observable, of } from 'rxjs';
import {  MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { Router } from '@angular/router';
import { SharedService } from '../shared.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styles: [`

    .autocomplete-list {
      border: 1px solid #ddd;
      background-color: white;
      position: absolute;
      z-index: 1000;
      max-height: 200px;
      overflow-y: auto;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .autocomplete-list div {
      padding: 8px;
      cursor: pointer;
    }

    .autocomplete-list div:hover {
      background-color: #eee;
    }
  `]

})
export class HeaderComponent implements OnInit {

  @ViewChild('searchInput') searchInput!: ElementRef;
  @ViewChild('trigger') autocompleteTrigger!: MatAutocompleteTrigger;

  public currentTime: string = this.updateCurrentTime();
  public searchQuery: string = ' ';
  public cityList: string[] = [];
  public filteredCities: Observable<string[]> = of([]);
  public lastSearched: string[] = [];
  public isSmallScreen = false;

  constructor(
    public sharedService: SharedService,
    private weatherService: WeatherService,
    private router: Router,
    public translate: TranslateService
  ) { }

  ngOnInit() {
    this.getCityList();
    const item = localStorage.getItem('lastSearched');
    this.lastSearched = item ? JSON.parse(item) : [];

    this.checkScreenSize();

    // check every second to see if we need to update the time
    setInterval(() => {
      const newTime = this.updateCurrentTime();
      if (this.currentTime !== newTime) {
        this.currentTime = newTime;
      }
    }, 1000);

    // Makes sure the search query is empty when starting the app
    this.resetSearchQuery();
    setTimeout(() => {
      if (this.searchInput) {
        this.searchInput.nativeElement.blur();
      }
    }, 0);
  }

  openSearch() {
    this.router.navigate(['/search']);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  public checkScreenSize() {
    this.isSmallScreen = window.innerWidth < 640; // Tailwind's `sm` breakpoint
  }

  // Updates the current time in HH:MM format
  public updateCurrentTime() {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  }

  private _filter(value: string): string[] {
    if (value.length < 1) {
      return [...this.lastSearched].reverse();
    }
    return this.cityList.filter(city => city.toLowerCase().includes(value.toLowerCase()));
  }

  public onSearchbarFocus() {
    if (this.searchQuery.trim() === '') {
      this.filteredCities = of([...this.lastSearched].reverse());
    }
  }

  public onSearchbarBlur() {
    setTimeout(() => {
      this.filteredCities = of([]);
    }, 100); // Delay to allow click event to register before hiding
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

  // Update the search query if city is selected from the autocomplete list
  // For now we show no error message in the placeholder if no results are found
  public onEnterPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      const currentValue = this.searchQuery.toLowerCase();
      const matchingCities = this.cityList.filter(city =>
        city.toLowerCase().includes(currentValue)
      );
      if (matchingCities.length === 1 || this.cityList.map(c => c.toLowerCase()).includes(currentValue)) {
        this.updateSearchQuery(matchingCities.length === 1 ? matchingCities[0] : currentValue);
        document.getElementById('searchForm')?.setAttribute('placeholder', 'Search for a city');
      } else {
        document.getElementById('searchForm')?.setAttribute('placeholder', 'No results found');
      }
      this.resetSearchQuery();
    }
  }

  // Update the search query and navigate to the home page
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


  // Add the city to the last searched list and save to local storage, with a max of 3 cities
  private addCityToLastSearched(city: string) {
    const index = this.lastSearched.indexOf(city);
    if (index > -1) {
      this.lastSearched.splice(index, 1);
    }
    this.lastSearched.push(city);
    while (this.lastSearched.length > 3) {
      this.lastSearched.shift();
    }
    localStorage.setItem('lastSearched', JSON.stringify(this.lastSearched));
  }

  private getCityList() {
    const cityList = localStorage.getItem('cityList');
    let fetchNew = true;
    if (cityList) {
      const { time, cityList: cities } = JSON.parse(cityList);
      // If the city list was fetched less than 30 minutes ago, use it
      if (new Date().getTime() - time < 1800000) {
        this.cityList = cities;
        this.filteredCities = of(this._filter(''));
        fetchNew = false;
      }
    }

    if (fetchNew) {
      this.weatherService.getCityList().subscribe((data: string[]) => {
        this.cityList = data;
        const time = new Date().getTime();
        localStorage.setItem('cityList', JSON.stringify({ time, cityList: this.cityList }));
        this.filteredCities = of(this._filter(''));
      });
    }
  }

  isRouteActive(route: string): boolean {
    return this.router.url === route;
  }
}
