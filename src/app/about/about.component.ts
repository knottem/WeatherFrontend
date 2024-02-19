import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  standalone: true,
  imports: [CommonModule],
  })

export class AboutComponent {

  constructor() {}

  ngOnInit(): void { }

}