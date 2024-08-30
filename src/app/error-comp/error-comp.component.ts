import {Component, Input} from '@angular/core';
import {ErrorService} from "../error.service";

@Component({
  selector: 'app-error-comp',
  templateUrl: './error-comp.component.html',
  styleUrls: ['./error-comp.component.css']
})
export class ErrorCompComponent {
  @Input() errorMessage: string | null = null;

  constructor(private errorService: ErrorService) {}

  dismissError() {
    this.errorService.clearError();
  }



}
