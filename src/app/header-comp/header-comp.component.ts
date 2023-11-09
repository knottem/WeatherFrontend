import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-header-comp',
  templateUrl: './header-comp.component.html',
  styleUrls: ['./header-comp.component.css']
})
export class HeaderCompComponent implements OnInit {

  public currentTime: string = this.updateCurrentTime();
  
  constructor() { }

  ngOnInit() {

    // check every second to see if we need to update the time
    setInterval(() => {
      const newTime = this.updateCurrentTime();
      if (this.currentTime !== newTime) {
        this.currentTime = newTime;
      }
    }, 1000);
    
  }

  // Updates the current time in HH:MM format, padded with leading zeros if necessary
  private updateCurrentTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
 
}
