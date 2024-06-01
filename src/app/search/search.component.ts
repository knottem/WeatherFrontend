import { Component, OnInit } from '@angular/core';
import { WeatherService } from '../weather.service';
import { Observable, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SharedService } from '../shared.service';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {IonicModule} from "@ionic/angular";
import {FormsModule} from "@angular/forms";

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

  public searchQuery: string = '';
  public cityList: string[] = [];
  public filteredCities: Observable<string[]> = of([]);
  public lastSearched: string[] = [];
  public headerHeight: number = 0;

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
      if (new Date().getTime() - time < 1800000) {
        this.cityList = cities;
        fetchNew = false;
      }
    }

    if (fetchNew) {
      this.weatherService.getCityList().subscribe((data: string[]) => {
        this.cityList = data;
        const time = new Date().getTime();
        localStorage.setItem('cityList', JSON.stringify({ time, cityList: this.cityList }));
      });
    }
  }
}
