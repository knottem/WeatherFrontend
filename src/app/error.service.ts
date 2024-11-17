import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import {LangChangeEvent, TranslateService} from "@ngx-translate/core";

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  private errorSubject = new Subject<string | null>();
  private currentErrorKey: string | null = null;

  constructor(public translate: TranslateService){

    // Re-translates a translated error if a user changes the language while it still active.
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      if (this.currentErrorKey) {
        this.errorSubject.next(this.translate.instant(this.currentErrorKey));
      }
    });
  }

  getError(): Observable<string | null> {
    return this.errorSubject.asObservable();
  }

  setError(message: string | null) {
    this.currentErrorKey = null;
    this.errorSubject.next(message);
  }

  setTranslatedError(message: string){
    this.currentErrorKey = message;
    this.errorSubject.next(this.translate.instant(message));
  }

  clearError() {
    this.currentErrorKey = null;
    this.errorSubject.next(null);
  }
}
