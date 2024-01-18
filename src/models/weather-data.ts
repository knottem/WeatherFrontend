export class WeatherData {
    message: string;
    timestamp: string;
    city: {
      name: string;
      lon: number;
      lat: number;
    }
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
        this.city = {
          name: '',
          lon: 0,
          lat: 0,
        };
        this.information = {
          time: '',
          temperature: '',
          windSpeed: '',
          precipitation: '',
        };
        this.weatherData = {};
      }
  }