export class WeatherData {
    message: string;
    timestamp: string;
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
        this.timestamp = '';
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