import { Injectable } from '@angular/core';
import { LoggingService, Logger } from './logging.service';
import { StorageService } from './storage.service';
import { CacheData } from '../models/cache-data';
import { Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { FeedData } from '../models/feed-data';
import { Settings } from '../settings';

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private logger: Logger;
  private entryTTL: number;

  constructor(private loggingService: LoggingService, private storage: StorageService) {
    this.logger = this.loggingService.getLogger(CacheService.name, LoggingService.Level.Debug);
    this.entryTTL = 15 * 60 * 1000; // 15 minutes
  }

  get(streamID: string): Observable<FeedData> {
    this.logger.debug('getting cache', streamID);
    const cacheKey = CacheData.generateCacheKey(streamID);
    return this.storage.getLocal(Settings.cache).pipe(
      map((cache) => {
        if (cache instanceof Error) {
          this.logger.error(`failed to get cache for ${streamID}`, cache);
          return null;
        }
        const cacheValue = cache.get(Settings.cache) || {};
        if (Object.keys(cacheValue).length === 0) {
          return null;
        }
        for (const key of Object.keys(cacheValue)) {
          if (key === cacheKey) {
            const cachedFeed: CacheData = cacheValue[cacheKey]  ;
            this.logger.debug(`cache hit for ${streamID}`, cacheValue);
            if ((cachedFeed.lastSynced + this.entryTTL) < new Date().getTime()) {
              this.logger.debug(`cache expired for ${streamID}`);
              return null;
            }
            this.logger.debug(`found cache data for ${streamID}`);
            return cachedFeed.feedData;
          }
        }
        this.logger.debug(`cache miss for ${streamID}`);
        return null;
      })
    );
  }

  set(streamID: string, feedData: FeedData): Observable<null | Error> {
    this.logger.debug('setting cache', streamID);
    const cacheKey = CacheData.generateCacheKey(streamID);
    const cacheEntry = new CacheData(feedData);
    return this.storage.getLocal('cache').pipe(
      map((cache) => {
        if (cache instanceof Error) {
          this.logger.error(`failed to set cache for ${streamID}`, cache);
          return null;
        }
        const cacheValue = cache.get(Settings.cache) || {};
        cacheValue[cacheKey] = cacheEntry.toObject();
        return cacheValue;
      }),
      mergeMap(
        updatedCache =>  {
          return this.storage.setLocal(new Map([[Settings.cache, updatedCache]]));
        }
      )
    );
  }

  unset(streamID: string): Observable<null | Error> {
    this.logger.debug('unsetting', streamID);
    const cacheKey = CacheData.generateCacheKey(streamID);
    return this.storage.getLocal('cache').pipe(
      map((cache) => {
        if (cache instanceof Error) {
          this.logger.error(`failed to unset cache for ${streamID}`, cache);
          return null;
        }
        const cacheValue = cache.get(Settings.cache);
        this.logger.debug('cv', cacheValue);
        if (!cacheValue) {
          this.logger.debug('got nothing');
          return null;
        }
        for (const key of Object.keys(cacheValue)) {
          if (key === cacheKey) {
            this.logger.debug(`cache hit for ${streamID}`, cacheValue);
            delete cacheValue[cacheKey];
          }
        }
        return cacheValue;
      }),
      mergeMap(
        updatedCache =>  {
          this.logger.debug(updatedCache);
          return this.storage.setLocal(new Map([[Settings.cache, updatedCache]]));
        }
      )
    );
  }

}
