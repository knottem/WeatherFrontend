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

  public currentLanguage = this.translate.currentLang;
  public version: string = environment.apiVersion;

  constructor(public translate: TranslateService) { }

  switchLanguage(language: string) {
    this.translate.use(language);
    this.currentLanguage = language;
    localStorage.setItem('language', language);
  }

}
