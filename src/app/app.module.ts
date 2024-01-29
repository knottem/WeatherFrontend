import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WeatherDisplayComponent } from './weather-display/weather-display.component';
import { HeaderComponent } from './header/header.component';
import { ErrorCompComponent } from './error-comp/error-comp.component';
import { LoadingIndicatorComponent } from './loading-indicator/loading-indicator.component';
import { FormsModule } from '@angular/forms';
import { WeatherService } from './weather.service';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { WeatherTableComponent } from './weather-table/weather-table.component';
import { FooterComponent } from './footer/footer.component';


@NgModule({
  declarations: [
    AppComponent,
    WeatherDisplayComponent,
    HeaderComponent,
    ErrorCompComponent,
    LoadingIndicatorComponent,
    WeatherTableComponent,
    FooterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatAutocompleteModule,
    MatInputModule,
    ReactiveFormsModule
  ],
  providers: [WeatherService],
  bootstrap: [AppComponent]
})
export class AppModule { }
