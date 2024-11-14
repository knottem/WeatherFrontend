import { Component } from '@angular/core';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import { CommonModule } from "@angular/common";
import {IonicModule, Platform} from "@ionic/angular";
import {FormsModule} from "@angular/forms";
import {environment} from "../../environments/environment";
import {SharedService} from "../shared.service";
import {ErrorService} from "../error.service";
import {MatFormField, MatOption, MatSelect} from "@angular/material/select";
import { ScreenBrightness } from '@capacitor-community/screen-brightness';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, TranslateModule, IonicModule, FormsModule, MatSelect, MatOption, MatFormField],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent {

  // All the languages that the app supports
  public languages: { code: string, name: string }[] = [
    { code: 'en', name: 'English' },
    { code: 'sv', name: 'Svenska' },
    { code: 'de', name: 'Deutsch' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' }
  ];

  // All the APIs that the app supports
  public apis: { name: string, value: string}[] = [
    { name: 'SMHI', value: 'smhi' },
    { name: 'YR', value: 'yr'},
    { name: 'FMI', value: 'fmi'}
  ]
  isDarkMode: boolean = false;
  public currentLanguage = this.translate.currentLang;
  public version: string = environment.apiVersion;
  public selectedApis: string[];
  brightnessLevel: number; // Default brightness level

  constructor(public translate: TranslateService,
              private sharedService: SharedService,
              private errorService: ErrorService,
              private platform: Platform
              ) {
    this.sharedService.darkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });
    const settings = this.sharedService.loadUserSettings();
    const userApis = settings.apis;
    if (userApis) {
      this.selectedApis = userApis;
    } else {
      this.selectedApis = ['smhi', 'yr', 'fmi'];
    }
    this.brightnessLevel = this.sharedService.loadUserSettings().brightness || 100;
  }

  toggleDarkMode(){
    this.sharedService.toggleDarkMode();
  }

  switchLanguage(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const language = selectElement.value;
    this.translate.use(language);
    this.currentLanguage = language;
    const settings = this.sharedService.loadUserSettings();
    settings.language = language;
    this.sharedService.saveUserSettings(settings);
  }

  onApiChange(api: string, event: Event) {
    const isSelected = this.selectedApis.includes(api);

    if (isSelected) {
      if(this.selectedApis.length === 2 && api !== 'fmi' && this.selectedApis.includes('fmi')) {
        this.errorService.setTranslatedError("error.fmiError");
        return;
      }

      if (this.selectedApis.length > 1) {
        this.selectedApis = this.selectedApis.filter(a => a !== api);
      } else {
        this.errorService.setTranslatedError("error.singleApiError")
        return;
      }
    } else {
      this.selectedApis.push(api);
    }
    const settings = this.sharedService.loadUserSettings();
    settings.apis = this.selectedApis;
    this.sharedService.saveUserSettings(settings)
  }

  async onBrightnessChange(event: Event) {
    const level = (event.target as HTMLInputElement).valueAsNumber;
    this.brightnessLevel = level;
    this.sharedService.saveBrightnessSetting(level);

    if (this.platform.is('android') || this.platform.is('ios')) {
      const brightness = level / 100
      await ScreenBrightness.setBrightness({ brightness });
      const {brightness: currentBrightness} = await ScreenBrightness.getBrightness();
      console.log({brightness: currentBrightness})
    } else {
      const adjustedLevel = 70 + (level * 0.3);
      const appElement = document.getElementById('app-root');
      if (appElement) {
        appElement.style.filter = `brightness(${adjustedLevel}%)`;
      }
    }
  }

}
