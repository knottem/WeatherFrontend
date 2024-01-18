// app-routing.module.ts

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WeatherDisplayComponent } from './weather-display/weather-display.component';
import { WeatherListComponent } from './weather-list/weather-list.component';
import { UserAuthComponent } from './user-auth/user-auth.component';
import { CityManagementComponent } from './city-management/city-management.component';

const routes: Routes = [
  { path: '', component: WeatherDisplayComponent }, // Default route
  { path: 'list', component: WeatherListComponent },
  { path: 'login', component: UserAuthComponent },
  { path: 'manage-cities', component: CityManagementComponent },
  { path: '**', redirectTo: '' }, // Wildcard route
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}