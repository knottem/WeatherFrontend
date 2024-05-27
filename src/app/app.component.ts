import { Component } from '@angular/core';
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-root',
  template: `
      <app-header></app-header>
      <app-error-comp></app-error-comp>
      <router-outlet></router-outlet>
      <app-footer></app-footer>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        width: 80%;
        min-width: 600px;
        max-width: 1400px;
        margin: 0 auto;
        font-family: Roboto, sans-serif;
      }

      @media (max-width: 1024px) {
        :host {
          width: 100%;
          min-width: 0;
          margin: 0;
        }
      }
    `,
  ],
})
export class AppComponent {
  constructor(translate: TranslateService) {
    // check if the user has a language preference stored in cookies
    const userLang = localStorage.getItem('language');
    if (userLang) {
      translate.setDefaultLang(userLang);
      translate.use(userLang);
    } else {
      translate.setDefaultLang('en');
      translate.use('en');
    }
  }
}
