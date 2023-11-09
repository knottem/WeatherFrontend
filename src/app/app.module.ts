import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WeatherDisplayComponent } from './weather-display/weather-display.component';
import { CitySearchComponent } from './city-search/city-search.component';
import { WeatherListComponent } from './weather-list/weather-list.component';
import { UserAuthComponent } from './user-auth/user-auth.component';
import { CityManagementComponent } from './city-management/city-management.component';
import { HeaderCompComponent } from './header-comp/header-comp.component';
import { ErrorCompComponent } from './error-comp/error-comp.component';
import { LoadingIndicatorComponent } from './loading-indicator/loading-indicator.component';

@NgModule({
  declarations: [
    AppComponent,
    WeatherDisplayComponent,
    CitySearchComponent,
    WeatherListComponent,
    UserAuthComponent,
    CityManagementComponent,
    HeaderCompComponent,
    ErrorCompComponent,
    LoadingIndicatorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
