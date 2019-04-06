import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  navbarCollapsed: boolean;
  searchbarOpen: boolean;

  constructor() { }

  ngOnInit() {
    this.navbarCollapsed = true;
    this.searchbarOpen = false;
  }

  showYourLove(): void {
    
  }
  toggleSearchbar(): void {
    this.searchbarOpen = true;
   }

}
