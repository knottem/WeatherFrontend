export class WeatherData {
    message: string;
    timeStamp: string;
    city: null;
    information: {
      time: string;
      temperature: string;
      windSpeed: string;
      precipitation: string;
    };
    weatherData: {
      [timestamp: string]: {
        temperature: number;
        weatherCode: number;
        windSpeed: number;
        windDirection: number;
        precipitation: number;
      };
    };

    constructor() {
        this.message = '';
        this.timeStamp = '';
        this.city = null;
        this.information = {
          time: '',
          temperature: '',
          windSpeed: '',
          precipitation: '',
        };
        this.weatherData = {};
      }
  }