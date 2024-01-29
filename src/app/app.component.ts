import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <!-- app.component.html -->
    <app-header></app-header>
    <!-- Header and navigation -->

    <router-outlet></router-outlet>
    <!-- This is where routed components will be displayed -->

    <app-footer></app-footer>
    <!-- Footer -->

    <app-error-comp></app-error-comp>
    <!-- Error handling and messages -->
  `,
  styleUrls: ['./app.component.css'],
})
export class AppComponent {}
