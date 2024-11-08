import { Component } from '@angular/core';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import { CommonModule } from "@angular/common";
import {IonicModule} from "@ionic/angular";
import {FormsModule} from "@angular/forms";
import {environment} from "../../environments/environment";
import {SharedService} from "../shared.service";

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, TranslateModule, IonicModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent {

  public isDarkMode = false;

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

  public currentLanguage = this.translate.currentLang;
  public version: string = environment.apiVersion;
  public selectedApis: string[];

  constructor(public translate: TranslateService, private sharedService: SharedService,) {
    const userApis = localStorage.getItem('apis');
    if (userApis) {
      this.selectedApis = JSON.parse(userApis);
    } else {
      this.selectedApis = ['smhi', 'yr', 'fmi'];
    }
  }

  ngOnInit(){
    const settings = JSON.parse(localStorage.getItem("userSettings") || "{}");
    this.isDarkMode = settings.darkMode === "on"
  }

  toggleDarkMode(){
    this.isDarkMode = !this.isDarkMode
    const settings = this.sharedService.loadUserSettings();
    settings.darkMode = this.isDarkMode ? "on" : "off";
    this.sharedService.saveUserSettings(settings);

    if(this.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
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
        console.warn("FMI can't be used alone. Please keep at least one other API selected.");
        return;
      }

      if (this.selectedApis.length > 1) {
        this.selectedApis = this.selectedApis.filter(a => a !== api);
      } else {
        console.warn('You must have at least one API selected.');
      }
    } else {
      this.selectedApis.push(api);
    }
    localStorage.setItem('apis', JSON.stringify(this.selectedApis));
  }

}
