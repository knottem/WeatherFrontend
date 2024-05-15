import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { environment } from 'src/environments/environment';
import { SharedService } from '../shared.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  template: `
    <!-- Footer Text -->
    <div class="flex justify-between items-start sm:items-center mx-2">
      <div *ngIf="updatedTime === ''">
        <p class="text-gray-600 text-xs mt-4 sm:text-sm" [innerHTML]="translatedSources"></p>
      </div>
      <div *ngIf="updatedTime !== ''">
        <p class="text-gray-600 text-xs mt-4 sm:text-sm">
          <span class="block sm:inline">
            {{ 'footer.updated' | translate }} {{ updatedTime }}.
          </span>
          <span class="block sm:inline" [innerHTML]="translatedSources"></span>
        </p>
      </div>
      <p class="text-gray-600 text-xs mt-4 sm:text-sm">
        <span class="block sm:inline">Version:</span>
        <span class="block sm:inline">{{ version }}</span>
      </p>
    </div>
  `,
})
export class FooterComponent implements OnInit {
  public version: string = '';
  public updatedTime: string = '';
  public translatedSources: string = '';

  constructor(
    private sharedService: SharedService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.sharedService.updatedTime$.subscribe((time) => {
      this.updatedTime = time;
    });

    this.sharedService.weatherSources$.subscribe((sources) => {
      this.updateTranslatedSources(sources);
    });

    this.version = environment.apiVersion;

    this.translate.onLangChange.subscribe(() => {
      this.updateTranslatedSources(this.sharedService.weatherSourcesSource.getValue());
    });
  }

  private async updateTranslatedSources(sources: string[]) {
    const formattedSources = await this.formatSources(sources);
    this.translate.get('footer.sources', { sourceList: formattedSources }).subscribe((res: string) => {
      this.translatedSources = res;
      this.cdr.detectChanges();
    });
  }

  private async formatSources(sources: string[]): Promise<string> {
    if (sources.length === 0) return '';
    if (sources.length === 1) return sources[0];

    const and = await this.translate.get('footer.and').toPromise();
    const allButLast = sources.slice(0, -1).join(', ');
    const last = sources[sources.length - 1];
    return `${allButLast} ${and} ${last}`;
  }
}
