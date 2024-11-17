import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { ErrorCompComponent } from './error-comp/error-comp.component';
import { FormsModule } from '@angular/forms';
import { WeatherService } from './weather.service';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { FooterComponent } from './footer/footer.component';
import { TranslateModule, TranslateLoader} from "@ngx-translate/core";
import { TranslateHttpLoader} from "@ngx-translate/http-loader";
import { IonicModule} from "@ionic/angular";
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AngularSvgIconModule } from "angular-svg-icon";
import {SharedService} from "./shared.service";

export function initializeAppFactory(sharedService: SharedService) {
  return () => sharedService.initializeApp();
}

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    ErrorCompComponent,
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
    ReactiveFormsModule,
    DragDropModule,
    AngularSvgIconModule,
    IonicModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    WeatherService,
    SharedService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAppFactory,
      deps: [SharedService],
      multi: true
    }
  ],
  exports: [
    ErrorCompComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http);
}
