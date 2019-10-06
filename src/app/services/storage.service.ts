import { Observable, defer } from 'rxjs';
import { Injectable } from '@angular/core';
import { browser } from 'webextension-polyfill-ts';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  get(key?: string): Observable<Map<string, any> | Error> {
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

  set(settings: Map<string, any>): Observable<boolean | Error> {
    const settingsObj = {};
    for (let [key, value] of settings) {
      settingsObj[key] = value;
    }
    return defer(() => {
      return browser.storage.sync.set(settingsObj).then(() => {
        if (browser.runtime.lastError) {
          return new Error('StorageError: ' + browser.runtime.lastError);
        }
        return true;
      }, (err) => {
          return Error('StorageError: ' + browser.runtime.lastError);
      });
    });
  }

  clear(): Observable<boolean | Error> {
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
}
