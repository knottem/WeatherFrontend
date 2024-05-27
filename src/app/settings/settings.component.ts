import { Component } from '@angular/core';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import { CommonModule } from "@angular/common";

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, TranslateModule],
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

  constructor(public translate: TranslateService) { }

  switchLanguage(language: string) {
    this.translate.use(language);
    this.currentLanguage = language;
    localStorage.setItem('language', language);
  }

}
