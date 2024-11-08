import { Component } from '@angular/core';
import {SharedService} from "../shared.service";

@Component({
  selector: 'app-footer',
  template: `
    <!-- Footer Text -->
    <ion-tabs>
      <ion-tab-bar slot="bottom"  [attr.color]="isDarkMode ? 'dark' : 'light'">

        <ion-tab-button tab="weather">
          <ion-icon src="assets/icons/partly-sunny-outline.svg"></ion-icon>
          <ion-label>{{ 'weather' | translate }}</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="about">
          <ion-icon src="assets/icons/information-circle-outline.svg"></ion-icon>
          <ion-label>{{ 'about.title' | translate }}</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="settings">
          <ion-icon src="assets/icons/settings-outline.svg"></ion-icon>
          <ion-label>{{ 'settings.title' | translate }}</ion-label>
        </ion-tab-button>

      </ion-tab-bar>
    </ion-tabs>

  `
})
export class FooterComponent {
  isDarkMode: boolean = false;
  constructor(private sharedService: SharedService) {}

  ngOnInit() {
    this.sharedService.darkMode$.subscribe((darkMode) => {
      this.isDarkMode = darkMode;
    });
  }
}
