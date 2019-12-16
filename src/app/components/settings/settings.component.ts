import { Component, OnInit } from '@angular/core';
import { StorageService } from 'src/app/services/storage.service';
import { Settings } from 'src/app/settings';
import { ToastService } from 'src/app/services/toast.service';
import { LoggingService, Logger } from 'src/app/services/logging.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  showProgressbar: boolean;
  showGreeting: boolean;
  userName: string;
  feedType: string;
  feedViewCompact: boolean;
  shuffleFeed: boolean;
  logger: Logger;

  constructor(private storage: StorageService, private toastService: ToastService, private logging: LoggingService) {
    this.logger = this.logging.getLogger(SettingsComponent.name, this.logging.Level.Debug);
  }

  ngOnInit() {
    // TODO: Initialize with defaults
    this.showProgressbar = false;
    this.showGreeting = true;
    this.userName = 'User';
    this.shuffleFeed = false;
    this.feedType = 'b';
    this.feedViewCompact = false;
    this.storage.get(Settings.userSettings).subscribe((settings) => {
      this.showProgressbar = false;
      if (settings instanceof Error) {
        this.toastService.showError('Error fetching settings');
        // TODO: Add alert
        this.logger.error('failed to get settings', settings);
        return;
      }

      this.shuffleFeed = settings.get(Settings.userSettings).shuffleFeed;
      this.feedType = settings.get(Settings.userSettings).feedType;
      this.showGreeting = settings.get(Settings.userSettings).showGreeting;
      this.userName = settings.get(Settings.userSettings).userName;
      this.feedViewCompact = settings.get(Settings.userSettings).feedViewCompact;
    });
  }

  saveConfig() {
    const updatedConfig = {
      showGreeting: this.showGreeting,
      userName: this.userName,
      feedType: this.feedType,
      shuffleFeed: this.shuffleFeed,
      feedViewCompact: this.feedViewCompact
    };
    this.logger.debug('saving config', updatedConfig);
    this.storage.set(new Map([[ Settings.userSettings, updatedConfig ]])).subscribe(
      err => {
        if (err) {
          this.toastService.showError('An occurred when updating settings!');
          this.logger.error('An error occurred when updating user settings.', err);
        } else {
          this.toastService.showSuccess('Settings updated');
        }
      }
    );
  }

  setFeedPref(preference: string) {
    switch (preference) {
      case 'l':
        this.feedType = 'l';
        break;
      case 't':
        this.feedType = 't';
        break;
      case 'b':
        this.feedType = 'b';
        break;
      default:
        this.feedType = 'b';
        break;
    }
  }

  setFeedViewPref(preference: string) {
    switch (preference) {
      case 'compact':
        this.feedViewCompact = true;
        break;
      case 'cozy':
        this.feedViewCompact = false;
        break;
      default:
        this.feedViewCompact = false;
        break;
    }
  }

}
