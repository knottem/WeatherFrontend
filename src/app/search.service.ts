import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class SearchService {
  private searchQuerySubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public searchQuery$: Observable<string> = this.searchQuerySubject.asObservable();


  setSearchQuery(query: string) {
    // TODO: if the query contains a city that is not in the list of cities, do not update the search query
    this.searchQuerySubject.next(query.toLocaleLowerCase());
  }

  getSearchQuery(): string {
    return this.searchQuerySubject.value;
  } 

}
