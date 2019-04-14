import { StorageService } from './services/storage.service';
import { Component, OnInit } from '@angular/core';

const DEFAULT_SETTINGS = {
  userSettings: {
      showGreeting: true,
      userName: 'User',
      feedType: 'b',
      shuffleFeed: true
  },
  feedList: []
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'blink-nxt';

  constructor(private storage: StorageService) { }

  ngOnInit() {
    this.storage.get().subscribe((settings) => {
      if (settings instanceof Error) {
        console.log('Uh Oh... let\'s just assume we\'re okay here', settings);
        return;
      }
      if (settings instanceof Map) {
        settings = settings as Map<string, any>;
        if (!settings.has('userSettings') || !settings.has('feedList')) {
          this.storage.set(new Map(Object.entries(DEFAULT_SETTINGS))).subscribe(_ => {
            this.storage.get().subscribe((data) => {
              console.log(JSON.stringify(data));
            });
            console.log('Defaults set');
          });
        }
      }
    });
  }
}
