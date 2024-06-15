import { Component } from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import { RefresherCustomEvent } from '@ionic/angular';
import { App } from '@capacitor/app';

@Component({
  selector: 'app-root',
  template: `
    <ion-app>
      <ion-content>
        <div class="content-wrapper">
            <ion-refresher slot="fixed" (ionRefresh)="doRefresh($event)">
                <ion-refresher-content></ion-refresher-content>
            </ion-refresher>
            <app-header></app-header>
            <app-error-comp></app-error-comp>
            <router-outlet></router-outlet>
        </div>
      </ion-content>
      <div class="content-wrapper">
        <ion-footer>
          <ion-toolbar>
            <app-footer></app-footer>
          </ion-toolbar>
        </ion-footer>
      </div>

    </ion-app>
  `,
  styles: []
})
export class AppComponent {
  constructor(translate: TranslateService) {
    translate.setDefaultLang('en');
    const userLang = localStorage.getItem('language');
    if (userLang) {
      translate.use(userLang);
    }

    App.addListener('backButton', ({canGoBack}) => {
      if(!canGoBack){
        App.exitApp();
      } else {
        window.history.back();
      }
    });
  }

  doRefresh(event: RefresherCustomEvent) {
    location.reload();
  }
}
