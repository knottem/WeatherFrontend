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
          flex-direction: column;
        }
      }
    `,
  ],
})
export class AppComponent {
  constructor(private translate: TranslateService) {
    translate.setDefaultLang('en');
    translate.use('en');
  }
}
