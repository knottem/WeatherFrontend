import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styles: [``]
})
export class HeaderComponent implements OnInit {

  public showHeader = true;

  constructor(
    private router: Router,
    public translate: TranslateService
  ) { }

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if(event instanceof NavigationEnd) {
        this.showHeader = this.router.url !== '/search';
      }
    });
  }

  openSearch() {
    this.router.navigate(['/search']);
  }

}
