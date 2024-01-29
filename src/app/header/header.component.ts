import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { SearchService } from '../search.service';
import { WeatherService } from '../weather.service';
import { FormControl } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
  //styleUrls: ['./header-comp.component.css']
})
export class HeaderComponent implements OnInit {

  @ViewChild('searchInput') searchInput!: ElementRef;
  @ViewChild('trigger') autocompleteTrigger!: MatAutocompleteTrigger;

  public currentTime: string = this.updateCurrentTime();
  public searchQuery: FormControl = new FormControl('');
  public cityList: string[] = [];
  public filteredCities: Observable<string[]> = of([]);
  public lastSearched: string[] = [];

  constructor(
    public searchService: SearchService,
    private weatherService: WeatherService,
    private router: Router
  ) { }

  ngOnInit() {
    this.getCityList();
    const item = localStorage.getItem('lastSearched');
    this.lastSearched = item ? JSON.parse(item) : [];

    // check every second to see if we need to update the time
    setInterval(() => {
      const newTime = this.updateCurrentTime();
      if (this.currentTime !== newTime) {
        this.currentTime = newTime;
      }
    }, 1000);

  }

  // Updates the current time in HH:MM format
  public updateCurrentTime() {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  }

  // Listens for the tab key to be pressed while the search input is focused
  @HostListener('document:keydown.Tab', ['$event'])
  public onKeydownHandler(event: KeyboardEvent) {
    if (document.activeElement?.id === 'searchForm') {
      event.preventDefault();
      this.onEnterPress();
    }
  }

  private _filter(value: string): string[] {
    if (value.length < 1) {
      return [...this.lastSearched].reverse();
    }
    return this.cityList.filter(city => city.toLowerCase().includes(value.toLowerCase()));
  }

  public onCitySelected(event: MatAutocompleteSelectedEvent) {
    const selectedCity = event.option.value;
    if (selectedCity) {
      this.updateSearchQuery(selectedCity);
    }
    this.resetSearchQuery();
  }

  // Update the search query if city is selected from the autocomplete list
  // For now we show error message in the placerholder if no results are found
  public onEnterPress() {
    const currentValue = this.searchQuery.value.toLowerCase();
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

  // Update the search query and navigate to the home page
  public updateSearchQuery(city: string) {
    if (this.cityList.includes(city)) {
      this.addCityToLastSearched(city);
      this.searchService.setSearchQuery(city);
      this.router.navigate(['/']);
    }
  }

  private resetSearchQuery() {
    this.searchInput.nativeElement.blur();
    this.autocompleteTrigger.closePanel();
    this.searchQuery.reset('');
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
      if (new Date().getTime() - time < 86400000) {
        this.cityList = cities;
        this.filteredCities = this.searchQuery.valueChanges.pipe(
          startWith(''),
          map(value => this._filter(value))
        );
        fetchNew = false;
      }
    }

    if (fetchNew) {
      this.weatherService.getCityList().subscribe((data: string[]) => {
        this.cityList = data;
        const time = new Date().getTime();
        localStorage.setItem('cityList', JSON.stringify({ time, cityList: this.cityList }));
        this.filteredCities = this.searchQuery.valueChanges.pipe(
          startWith(''),
          map(value => this._filter(value))
        );
      });
    }
  }

  isRouteActive(route: string): boolean {
    return this.router.url === route;
  }
}
