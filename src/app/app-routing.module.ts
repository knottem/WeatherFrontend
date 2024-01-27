// app-routing.module.ts

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WeatherDisplayComponent } from './weather-display/weather-display.component';
import { AboutComponent } from './about/about.component';

const routes: Routes = [
  { path: '', component: WeatherDisplayComponent }, // Default route
  { path: 'about', component: AboutComponent },
  { path: '**', redirectTo: '' }, // Wildcard route
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}