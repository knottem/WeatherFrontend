import {Component, Input} from '@angular/core';
import {ErrorService} from "../error.service";

@Component({
  selector: 'app-error-comp',
  templateUrl: './error-comp.component.html',
  styleUrls: ['./error-comp.component.css']
})
export class ErrorCompComponent {
  @Input() errorMessage: string | null = null;
  shakeClass: string = '';
  shakeInterval: any;
  shakeTimeout: any;

  constructor(private errorService: ErrorService) {}

  ngOnInit() {
    this.errorService.getError().subscribe(message => {
      if (message) {
        this.startDelayedShakeLoop();
      } else {
        this.stopShakeLoop();
      }
    });
  }

  startDelayedShakeLoop() {
    this.stopShakeLoop();
    this.shakeTimeout = setTimeout(() => {
      this.startShakeLoop();
    }, 3000);
  }

  startShakeLoop() {
    this.shakeClass = 'shake';
    this.shakeInterval = setInterval(() => {
      this.shakeClass = 'shake';
      setTimeout(() => {
        this.shakeClass = '';
      }, 1000);
    }, 3000);
  }

  stopShakeLoop() {
    clearTimeout(this.shakeTimeout);
    clearInterval(this.shakeInterval);
    this.shakeClass = '';
  }

  dismissError() {
    this.errorMessage = null;
    this.errorService.clearError();
    this.stopShakeLoop();
  }

  ngOnDestroy() {
    this.stopShakeLoop();
  }




}
