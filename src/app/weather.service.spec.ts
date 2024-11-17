import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { WeatherService } from './weather.service';
import { HttpClient } from '@angular/common/http';
import {ErrorService} from "./error.service";
import {TranslateLoader, TranslateModule, TranslateService} from "@ngx-translate/core";
import {of} from "rxjs";
import {SharedService} from "./shared.service";

describe('WeatherService', () => {
  let service: WeatherService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useValue: { getTranslation: () => of({}) }  // Mocking empty translations
          }
        })
      ],
      providers: [WeatherService, ErrorService, TranslateService]
    });
    httpTestingController = TestBed.inject(HttpTestingController);
    service = new WeatherService(TestBed.inject(HttpClient), TestBed.inject(ErrorService), TestBed.inject(TranslateService), TestBed.inject(SharedService));
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

});
