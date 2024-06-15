import { Component } from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import { RefresherCustomEvent } from '@ionic/angular';
import { App } from '@capacitor/app';
import {Router} from "@angular/router";

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
  constructor(translate: TranslateService, private router: Router) {
    translate.setDefaultLang('en');
    const userLang = localStorage.getItem('language');
    if (userLang) {
      translate.use(userLang);
    }

    App.addListener('backButton', () => {
      if(this.isAtBaseRoute()){
        App.minimizeApp();
      } else {
        window.history.back();
      }
    });
  }

  doRefresh(event: RefresherCustomEvent) {
    location.reload();
  }

  private isAtBaseRoute(): boolean {
    // Add the routes that are considered base routes
    const baseRoutes = ['/', '/about', '/settings'];
    return baseRoutes.includes(this.router.url);
  }
}
