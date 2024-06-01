import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { TranslateModule } from "@ngx-translate/core";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import {IonicModule} from "@ionic/angular";

describe('HeaderCompComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      imports: [MatAutocompleteModule,
                HttpClientTestingModule,
                ReactiveFormsModule,
                FormsModule,
                TranslateModule.forRoot(),
                IonicModule.forRoot()],
      providers: [HeaderComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    });
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('#updateCurrentTime should return a string in HH:MM format', () => {
    const time = component.updateCurrentTime();
    expect(time).toMatch(/^\d{2}:\d{2}$/);
  });

  it('#updateCurrentTime should return current time', () => {
    const time = component.updateCurrentTime();
    const now = new Date();
    const expected = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    expect(time).toEqual(expected);
  });

});
