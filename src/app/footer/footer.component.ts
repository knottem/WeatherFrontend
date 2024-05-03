import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';
import { SharedService } from '../shared.service';

@Component({
  selector: 'app-footer',
  template: `
    <!-- Footer Text -->
    <div class="flex justify-between items-start sm:items-center mx-2">
      <div *ngIf="updatedTime === ''">
        <p class="text-gray-600 text-xs mt-4 sm:text-sm">
          {{ 'footer.sources' | translate }}
        </p>
      </div>
      <div *ngIf="updatedTime !== ''">
        <p class="text-gray-600 text-xs mt-4 sm:text-sm">
          <span class="block sm:inline">
            {{ 'footer.updated' | translate }} {{ updatedTime }}.
          </span>
          <span class="block sm:inline">{{ 'footer.sources' | translate }}</span>
        </p>
      </div>
      <p class="text-gray-600 text-xs mt-4 sm:text-sm">
        <span class="block sm:inline">Version:</span>
        <span class="block sm:inline">{{ version }}</span>
      </p>
    </div>
  `,
})

export class FooterComponent {
  public version: string = '';
  public updatedTime: string = '';

  constructor(private sharedService: SharedService) {}

  ngOnInit(): void {
    this.sharedService.updatedTime$.subscribe((time) => {
      this.updatedTime = time;
    });
    this.version = environment.apiVersion;
  }
}
