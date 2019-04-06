import { Observable, Subscription } from 'rxjs';
import { ClockService } from './../../services/clock.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  clock: Date;
  clockSubscription: Subscription;
  greeting: string;
  username: string;

  constructor(private clockService: ClockService) { }

  ngOnInit() {
    this.clock = new Date()
    this.username = "User";
    this.greeting = this.greetingFor(this.clock.getHours());
    this.clockSubscription = this.clockService.getClock().subscribe(time => {
      this.clock = time;
      this.greeting = this.greetingFor(time.getHours());
    });
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    this.clockSubscription.unsubscribe();
  }

  greetingFor(hours: number): string {
    if (hours > 3 && hours < 12) return "Morning";
    else if (hours >= 12 && hours < 16) return "Afternoon";
    else return "Evening";
  }

}
