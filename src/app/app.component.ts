import { Component } from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import { RefresherCustomEvent } from '@ionic/angular';
import { App } from '@capacitor/app';
import {Router} from "@angular/router";
import { ErrorService } from './error.service';

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
            <app-error-comp [errorMessage]="errorMessage"></app-error-comp>
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
  errorMessage: string | null = null;

  constructor(
    translate: TranslateService,
    private router: Router,
    private errorService: ErrorService  // Inject the ErrorService
  ) {
    translate.setDefaultLang('en');
    const userLang = localStorage.getItem('language');
    if (userLang) {
      translate.use(userLang);
    }

    App.addListener('backButton', () => {
      if(this.router.url === '/') {
        App.minimizeApp();
      } else {
        this.router.navigate(['/']);
      }
    });

    this.errorService.getError().subscribe(message => {
      this.errorMessage = message;
    });
  }

  doRefresh(event: RefresherCustomEvent) {
    location.reload();
  }

}
