import { TestBed } from '@angular/core/testing';

import { ErrorService } from './error.service';
import {TranslateModule} from "@ngx-translate/core";

describe('ErrorService', () => {
  let service: ErrorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot()
      ],
      providers: [
        ErrorService
      ]
    });
    service = TestBed.inject(ErrorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
