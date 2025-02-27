import { Component, OnInit, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styles: [`
  `]

})
export class HeaderComponent implements OnInit {

  public currentTime: string = this.updateCurrentTime();
  public isSmallScreen = false;
  public showHeader = true;

  private intervalId!: ReturnType<typeof setInterval>;

  constructor(
    private router: Router,
    public translate: TranslateService
  ) { }

  ngOnInit() {
    this.checkScreenSize();
    // check every second to see if we need to update the time
    this.intervalId = setInterval(() => {
      const newTime = this.updateCurrentTime();
      if (this.currentTime !== newTime) {
        this.currentTime = newTime;
      }
    }, 1000);

    this.router.events.subscribe((event) => {
      if(event instanceof NavigationEnd) {
        this.showHeader = this.router.url !== '/search';
      }
    });
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }

  openSearch() {
    this.router.navigate(['/search']);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  public checkScreenSize() {
    this.isSmallScreen = window.innerWidth < 640; // Tailwind's `sm` breakpoint
  }

  public updateCurrentTime() {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  }

}
