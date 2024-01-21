import { Component } from '@angular/core';

@Component({
  selector: 'app-loading-indicator',
  template: `<div class="loading-container">
                <div class="loading-spinner"></div>
                  <p>Loading, please wait...</p>
              </div>`,
  styleUrls: ['./loading-indicator.component.css']
})
export class LoadingIndicatorComponent {

}
