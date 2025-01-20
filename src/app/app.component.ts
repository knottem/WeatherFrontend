import {Component, HostListener} from '@angular/core';
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
    <ion-app id="app-root" class="content-wrapper">
      <ion-content [fullscreen]="true" class="bg-primary">
        <ion-refresher slot="fixed" (ionRefresh)="doRefresh($event)">
          <ion-refresher-content></ion-refresher-content>
        </ion-refresher>
        <app-header></app-header>
        <app-error-comp [errorMessage]="errorMessage"></app-error-comp>
        <router-outlet></router-outlet>
      </ion-content>
      <ion-footer>
        <ion-toolbar>
          <app-footer></app-footer>
        </ion-toolbar>
      </ion-footer>
    </ion-app>
  `,
  styles: []
})
export class AppComponent {
  errorMessage: string | null = null;
  isKeyboardOpen = false;
  isMobile = Capacitor.getPlatform() !== 'web';
  backgroundSet = false;

  private resizeListener: (() => void) | null = null;

  constructor(
    translate: TranslateService,
    private router: Router,
    private errorService: ErrorService,
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

      this.setBackground(window.innerWidth);
      this.addResizeListener()
    });
  }

  ngOnDestroy(): void {
    this.removeResizeListener();
  }

  doRefresh(event: RefresherCustomEvent) {
    location.reload();
  }

  setBackground(width: number) {
    if(width >= 1024 && !this.backgroundSet) {
      const htmlElement = document.documentElement;
      htmlElement.style.backgroundImage = "url('assets/images/pexels-pixabay-531880.jpg')";
      htmlElement.style.backgroundSize = "cover";
      htmlElement.style.backgroundPosition = "center";
      htmlElement.style.backgroundRepeat = "no-repeat";
      htmlElement.style.height = "100%";
      this.backgroundSet = true;
      this.removeResizeListener();
    }
  }

  private addResizeListener(): void {
    this.resizeListener = () => {
      if (!this.backgroundSet) {
        this.setBackground(window.innerWidth);
      }
    };
    window.addEventListener('resize', this.resizeListener);
  }

  private removeResizeListener(): void {
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
      this.resizeListener = null;
    }
  }
}
