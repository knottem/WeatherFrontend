import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  private updatedTimeSource = new BehaviorSubject<string>('');
  updatedTime$ = this.updatedTimeSource.asObservable();

  constructor() { }

  setUpdatedTime(time: string) {
    this.updatedTimeSource.next(time);
  }



  
}
