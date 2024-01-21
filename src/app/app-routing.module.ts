// app-routing.module.ts

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WeatherDisplayComponent } from './weather-display/weather-display.component';

const routes: Routes = [
  { path: '', component: WeatherDisplayComponent }, // Default route
  { path: '**', redirectTo: '' }, // Wildcard route
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}