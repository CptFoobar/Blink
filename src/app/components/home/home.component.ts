import { StorageService } from './../../services/storage.service';
import { Observable, Subscription } from 'rxjs';
import { ClockService } from './../../services/clock.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Settings } from 'src/app/settings';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  clock: Date;
  clockSubscription: Subscription;
  greeting: string;
  username: string;
  showGreeting: boolean;

  constructor(private clockService: ClockService, private storage: StorageService) { }

  ngOnInit() {
    this.clock = new Date();
    this.username = 'User';
    this.greeting = this.greetingFor(this.clock.getHours());
    this.clockSubscription = this.clockService.getClock().subscribe(time => {
      this.clock = time;
      this.greeting = this.greetingFor(time.getHours());
    });
    this.showGreeting = false;

    this.storage.get(Settings.userSettings).subscribe(settings => {
      if (settings instanceof Error) {
        console.log('failed getting user settings', settings);
        return;
      }
      this.username = settings.get(Settings.userSettings).userName;
      this.showGreeting = settings.get(Settings.userSettings).showGreeting;
    });
  }

  ngOnDestroy(): void {
    // Called once, before the instance is destroyed.
    this.clockSubscription.unsubscribe();
  }

  greetingFor(hours: number): string {
    if (hours > 3 && hours < 12) { return 'Morning'; }
    else if (hours >= 12 && hours < 16) { return 'Afternoon'; }
    else { return 'Evening'; }
  }

}
