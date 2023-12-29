import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { SearchService } from '../search.service';
import { WeatherService } from '../weather.service';
import { FormControl } from '@angular/forms';
import { Observable, of} from 'rxjs';
import { startWith, map} from 'rxjs/operators';
import { MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';


@Component({
  selector: 'app-header-comp',
  templateUrl: './header-comp.component.html',
  styleUrls: ['./header-comp.component.css']
})
export class HeaderCompComponent implements OnInit {

  public currentTime: string = this.updateCurrentTime();

  @ViewChild('searchInput') searchInput!: ElementRef;
  @ViewChild('trigger') autocompleteTrigger!: MatAutocompleteTrigger;
  public searchQuery: FormControl = new FormControl('');
  public cityList: string[] = [];
  filteredCities: Observable<string[]> = of([]);
  
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

    // check every second to see if we need to update the time
    setInterval(() => {
      const newTime = this.updateCurrentTime();
      if (this.currentTime !== newTime) {
        this.currentTime = newTime;
      }
    }, 1000);

  }

  private _filter(value: string): string[] {
    if (value.length < 1) {
      return [];
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
      console.log("City found");
      this.searchService.setSearchQuery(city);
    } else {
      console.log("City not found");
    }
  }

  public onCitySelected(event: MatAutocompleteSelectedEvent) {
    const selectedCity = event.option.value;
    if (selectedCity) {
      this.updateSearchQuery(selectedCity);
    }
    this.resetSearchQuery();
  }

  public onEnterPress() {
    const currentValue = this.searchQuery.value.toLowerCase();
    const matchingCities = this.cityList.filter(city => 
      city.toLowerCase().includes(currentValue)
    );
    if (matchingCities.length === 1 || this.cityList.map(c => c.toLowerCase()).includes(currentValue)) {
      this.updateSearchQuery(matchingCities.length === 1 ? matchingCities[0] : currentValue);
    }
    this.resetSearchQuery();
  }

  private resetSearchQuery() {
    this.searchInput.nativeElement.blur();
    this.autocompleteTrigger.closePanel();
    this.searchQuery.reset('');
  }
 
}
