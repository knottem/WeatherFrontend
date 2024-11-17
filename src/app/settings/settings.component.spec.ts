import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsComponent } from './settings.component';
import {TranslateModule} from "@ngx-translate/core";
import {HttpClientModule} from "@angular/common/http";

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        TranslateModule.forRoot()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
