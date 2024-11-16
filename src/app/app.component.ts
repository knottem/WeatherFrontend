import { Component } from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {Platform, RefresherCustomEvent} from '@ionic/angular';
import { App } from '@capacitor/app';
import {Router} from "@angular/router";
import { ErrorService } from './error.service';
import {SharedService} from "./shared.service";
import {Keyboard} from "@capacitor/keyboard";
import {Capacitor} from "@capacitor/core";

@Component({
  selector: 'app-root',
  template: `
    <ion-app class="bg-primary" id="app-root">
      <ion-content >
        <div class="content-wrapper bg-primary">
            <ion-refresher slot="fixed" (ionRefresh)="doRefresh($event)">
                <ion-refresher-content></ion-refresher-content>
            </ion-refresher>
            <app-header></app-header>
            <app-error-comp [errorMessage]="errorMessage"></app-error-comp>
            <router-outlet></router-outlet>
        </div>
      </ion-content>
      <div class="content-wrapper">
        <ion-footer [class.hide-footer]="isKeyboardOpen && isMobile">
          <ion-toolbar>
            <app-footer ></app-footer>
          </ion-toolbar>
        </ion-footer>
      </div>

    </ion-app>
  `,
  styles: []
})
export class AppComponent {
  errorMessage: string | null = null;
  isKeyboardOpen = false;
  isMobile = Capacitor.getPlatform() !== 'web';


  constructor(
    translate: TranslateService,
    private router: Router,
    private errorService: ErrorService,  // Inject the ErrorService
    private sharedService: SharedService,
    private platform: Platform
  ) {
    translate.setDefaultLang('en');
    const settings = this.sharedService.loadUserSettings();
    if (settings.language) {
      translate.use(settings.language);
    }

    if(this.isMobile) {
      Keyboard.addListener('keyboardWillShow', () => {
        this.isKeyboardOpen = true;
      });

      Keyboard.addListener('keyboardWillHide', () => {
        this.isKeyboardOpen = false;
      });
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

  ngOnInit(){
    this.platform.ready().then(() => {
      // Setting brightness after platform is ready
      const settings = this.sharedService.loadUserSettings();
      const brightness = settings.brightness ?? 100;
      this.sharedService.setBrightnessSetting(brightness);
    });
  }



  doRefresh(event: RefresherCustomEvent) {
    location.reload();
  }

}
