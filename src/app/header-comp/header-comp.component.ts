import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { SearchService } from '../search.service';
import { WeatherService } from '../weather.service';
import { FormControl } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';

@Component({
  selector: 'app-header-comp',
  templateUrl: './header-comp.component.html',
  styleUrls: ['./header-comp.component.css']
})
export class HeaderCompComponent implements OnInit {

  @ViewChild('searchInput') searchInput!: ElementRef;
  @ViewChild('trigger') autocompleteTrigger!: MatAutocompleteTrigger;

  public currentTime: string = this.updateCurrentTime();
  public searchQuery: FormControl = new FormControl('');
  public cityList: string[] = [];
  public filteredCities: Observable<string[]> = of([]);
  public lastSearched: string[] = [];

  constructor(public searchService: SearchService, private weatherService: WeatherService) { }

  ngOnInit() {
    // Get the list of cities
    this.weatherService.getCityList().subscribe((data: string[]) => {
      this.cityList = data;
      
       // Filter the list of cities based on the search query
       this.filteredCities = this.searchQuery.valueChanges.pipe(
        startWith(''),
        map(value => this._filter(value))
      );
    });

    this.loadlastSearched();

    // check every second to see if we need to update the time
    setInterval(() => {
      const newTime = this.updateCurrentTime();
      if (this.currentTime !== newTime) {
        this.currentTime = newTime;
      }
    }, 1000);

  }

  // Listen for the tab key to be pressed while the search input is focused
  @HostListener('document:keydown.Tab', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    if (document.activeElement?.id === 'searchForm') {
        event.preventDefault();
        this.onEnterPress();
    }
  }

  private loadlastSearched() {
    const storedFavorites = localStorage.getItem('lastSearched');
    if (storedFavorites) {
      this.lastSearched = JSON.parse(storedFavorites);
    }
  }

  public addCityToLastSearched(city: string) {
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

  private _filter(value: string): string[] {
    if (value.length < 1) {
      return [...this.lastSearched].reverse();
    }
    return this.cityList.filter(city => city.toLowerCase().includes(value.toLowerCase()));
  }

  // Updates the current time in HH:MM format
  public updateCurrentTime() {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  }

  public updateSearchQuery(city : string) {
    if(this.cityList.includes(city)) {
      this.addCityToLastSearched(city);
      this.searchService.setSearchQuery(city);
    } 
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

  private resetSearchQuery() {
    this.searchInput.nativeElement.blur();
    this.autocompleteTrigger.closePanel();
    this.searchQuery.reset('');
  }
 
}
