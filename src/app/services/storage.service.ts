import { Observable, defer } from 'rxjs';
import { Injectable } from '@angular/core';
import { browser } from 'webextension-polyfill-ts';
import { Logger, LoggingService } from './logging.service';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private logger: Logger;

  constructor(private logging: LoggingService) {
    this.logger = this.logging.getLogger(StorageService.name, LoggingService.Level.Debug);
  }

  // BUG: If no settings are found on init, empty settings are returned. This causes requester to error.

  getSync(key?: string): Observable<Map<string, any> | Error> {
    return defer(() => {
      return browser.storage.sync.get(key).then((settings) => {
        if (browser.runtime.lastError) {
          return new Error('StorageError: ' + browser.runtime.lastError);
        }
        return new Map<string, any>(Object.entries(settings));
      }, (err) => {
          return Error('StorageError: ' + browser.runtime.lastError);
      });
    });
  }

  setSync(settings: Map<string, any>): Observable<null | Error> {
    const settingsObj = {};
    for (let [key, value] of settings) {
      settingsObj[key] = value;
    }
    return defer(() => {
      return browser.storage.sync.set(settingsObj).then(() => {
        if (browser.runtime.lastError) {
          return new Error('StorageError: ' + browser.runtime.lastError);
        }
      }, (err) => {
          return Error('StorageError: ' + browser.runtime.lastError);
      });
    });
  }

  cleanSync(): Observable<boolean | Error> {
    return defer(() =>  {
      return browser.storage.sync.clear().then(() => {
        if (browser.runtime.lastError) {
          return new Error('StorageError: ' + browser.runtime.lastError);
        }
        return true;
      }, (err) => {
          return Error('StorageError: ' + browser.runtime.lastError);
      });
    });
  }

  getLocal(key?: string): Observable<Map<string, any> | Error> {
    return defer(() => {
      return browser.storage.local.get(key).then((settings) => {
        if (browser.runtime.lastError) {
          return new Error('StorageError: ' + browser.runtime.lastError);
        }
        return new Map<string, any>(Object.entries(settings));
      }, (err) => {
          return Error('StorageError: ' + browser.runtime.lastError);
      });
    });
  }

  setLocal(settings: Map<string, any>): Observable<null | Error> {
    const settingsObj = {};
    for (let [key, value] of settings) {
      settingsObj[key] = value;
    }
    return defer(() => {
      return browser.storage.local.set(settingsObj).then(() => {
        if (browser.runtime.lastError) {
          return new Error('StorageError: ' + browser.runtime.lastError);
        }
      }, (err) => {
          return Error('StorageError: ' + browser.runtime.lastError);
      });
    });
  }

  clearLocal(): Observable<boolean | Error> {
    return defer(() =>  {
      return browser.storage.local.clear().then(() => {
        if (browser.runtime.lastError) {
          return new Error('StorageError: ' + browser.runtime.lastError);
        }
        return true;
      }, (err) => {
          return Error('StorageError: ' + browser.runtime.lastError);
      });
    });
  }
}
