import type { CapacitorConfig } from '@capacitor/cli';
import {KeyboardResize} from "@capacitor/keyboard";

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'Weather App',
  webDir: 'dist/weather-frontend',
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      launchFadeOutDuration: 0,
      backgroundColor: '#D9E9EA',
      showSpinner: true,
      spinnerColor: '#222428'
    },
    Keyboard: {
      resize: KeyboardResize.Body,
      resizeOnFullScreen: true,
    }
  },
};

export default config;
