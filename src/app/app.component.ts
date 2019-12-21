import { StorageService } from './services/storage.service';
import { Component, OnInit } from '@angular/core';
import { Settings } from './settings';
import { LoggingService, Logger } from './services/logging.service';

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
  logger: Logger;

  constructor(private storage: StorageService, private loggingService: LoggingService) {
    this.logger = this.loggingService.getLogger(AppComponent.name, LoggingService.Level.Debug);
  }

  ngOnInit() {
    this.storage.get().subscribe((settings) => {
      if (settings instanceof Error) {
        this.logger.error('Error getting settings', settings);
        return;
      }
      if (settings instanceof Map) {
        settings = settings as Map<string, any>;
        if (!settings.has(Settings.userSettings) || !settings.has(Settings.feedList)) {
          this.storage.set(new Map(Object.entries(DEFAULT_SETTINGS))).subscribe(_ => {
            this.logger.info('Defaults set');
          });
        }
      }
    });
  }
}
