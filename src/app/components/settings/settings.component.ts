import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  showProgressbar: boolean;
  showGreeting: boolean;
  userName: string;

  constructor() { }

  ngOnInit() {
    this.showProgressbar = false;
    this.showGreeting = true;
    this.userName = "User";
  }

  saveConfig() {
    console.log(this.showGreeting, this.userName);
  }

}
