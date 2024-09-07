import { Component } from '@angular/core';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import { CommonModule } from "@angular/common";
import {IonicModule} from "@ionic/angular";
import {FormsModule} from "@angular/forms";
import {environment} from "../../environments/environment";

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, TranslateModule, IonicModule, FormsModule],
  templateUrl: './settings.component.html',
  //styleUrl: './settings.component.css'
})
export class SettingsComponent {

  public languages: { code: string, name: string }[] = [
    { code: 'en', name: 'English' },
    { code: 'sv', name: 'Svenska' },
    { code: 'de', name: 'Deutsch' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' }
  ];

  public apis = [
    { name: 'SMHI', value: 'smhi' },
    { name: 'YR', value: 'yr'},
    { name: 'FMI', value: 'fmi'}
  ]

  public currentLanguage = this.translate.currentLang;
  public version: string = environment.apiVersion;
  public selectedApis: string[];

  constructor(public translate: TranslateService) {
    const userApis = localStorage.getItem('apis');
    if (userApis) {
      this.selectedApis = JSON.parse(userApis);
    } else {
      this.selectedApis = ['smhi', 'yr', 'fmi'];
    }
  }

  switchLanguage(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const language = selectElement.value;
    this.translate.use(language);
    this.currentLanguage = language;
    localStorage.setItem('language', language);
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
