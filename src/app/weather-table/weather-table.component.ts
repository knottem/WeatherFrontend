import { Component, Input} from '@angular/core';
import { WeatherData } from '../../models/weather-data';
import { WeatherService } from '../weather.service';
import { trigger, style, animate, transition, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-weather-table',
  templateUrl: './weather-table.component.html',
  styleUrls: ['./weather-table.component.css'],
  animations: [
    trigger('fadeInStagger', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(-20px)' }),
          stagger('5ms', [
            animate('100ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true }),
        query(':leave', [
          stagger('-5ms', [
            animate('100ms ease-in', style({ opacity: 0, height: '0px' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('fadeInExpand', [
      transition(':enter', [
        style({ opacity: 0, height: '0px', overflow: 'hidden' }),
        animate('300ms ease-out', style({ opacity: 1, height: '*' }))
      ])
    ])
  ]
})

export class WeatherTableComponent {
  @Input() dayLabel: string = "";
  @Input() cityName: string = "";
  @Input() weather: WeatherData = new WeatherData();
  @Input() currentWeather: any;

  public collapsingIndex: number | null = null;
  public showWeather: boolean = false;
  public showDetail: boolean = false;
  public expandedRows: boolean[] = [];

  constructor(private weatherService: WeatherService) { }

  public getTimestamps(): string[] {
    return Object.keys(this.weather.weatherData);
  }

  public toggleDetailRow(index: number, event: Event): void {
    event.stopPropagation();
    this.expandedRows[index] = !this.expandedRows[index];
  }

  public toggleWeather(): void {
    this.showWeather = !this.showWeather;
    this.expandedRows = [];
  }

  public getWeatherConditionDescription(code: number): string {
    return this.weatherService.getWeatherCondition(code);
  }

  public onAnimationDone(index: number): void {
    if (this.collapsingIndex === index) {
      this.collapsingIndex = null;
    }
  }

}