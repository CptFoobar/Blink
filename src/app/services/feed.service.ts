import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, delay, mergeMap, tap, map } from 'rxjs/operators';
import { Observable, from, of, empty } from 'rxjs';
import { LoggingService, Logger } from './logging.service';

const httpOptions = {
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

@Injectable({
  providedIn: 'root'
})
export class FeedService {

  private static readonly TAG = 'FeedService';
  static readonly FEED_BALANCE_LATEST = 0;
  static readonly FEED_BALANCE_MIX = 1;
  static readonly FEED_BALANCE_TRENDING = 2;

  private readonly streamUrlPrefix = 'https://cloud.feedly.com/v3/streams/contents?streamId=';
  private readonly trendingUrlPrefix = 'https://cloud.feedly.com/v3/mixes/contents?streamId=';
  private readonly searchUrlPrefix = 'https://cloud.feedly.com/v3/search/feeds?q=';

  private readonly count7 = '&count=7';
  private readonly count8 = '&count=8';
  private readonly count15 = '&count=15';

  private logger: Logger;

  constructor(private http: HttpClient, private loggingService: LoggingService) {
    this.logger = this.loggingService.getLogger(FeedService.TAG, this.loggingService.Level.Debug);
  }

  getURL(url: string): Observable<any> {
    // BUG: Doesn't catch ERR_INTERNET_DISCONNECTED
    return this.http.get(url, httpOptions).pipe(
      catchError(err => {
        return of(new Error('HTTP Error: ' + err));
      })
    );
  }

  getStream(streamID: string, balance: number, randomDelay: number = 50): Observable<any> {
    let urls: string[] = [];
    switch (balance) {
      case FeedService.FEED_BALANCE_LATEST:
        urls.push(this.streamUrlPrefix + streamID + this.count15);
        break;
      case FeedService.FEED_BALANCE_TRENDING:
        urls.push(this.trendingUrlPrefix + streamID + this.count15);
        break;
      case FeedService.FEED_BALANCE_MIX:
        urls.push(this.streamUrlPrefix + streamID + this.count8);
        urls.push(this.trendingUrlPrefix + streamID + this.count7);
        break;
      default:
        urls.push(this.streamUrlPrefix + streamID + this.count8);
        urls.push(this.trendingUrlPrefix + streamID + this.count7);
        break;
    }
    return from(urls).pipe(
      tap(url => this.logger.debug(`getting ${url}`)),
      delay(Math.floor(Math.random() * randomDelay) + 100),
      mergeMap(url => this.getURL(url).pipe(
        catchError((err) => { this.logger.error('caught error when getting stream:', err); return of(new Error('Streams Error: ' + err)); })
      ))
    );
  }

  searchStreams(keyword: string): Observable<any> {
    this.logger.debug(`searching ${keyword}`);
    if (keyword.trim().length === 0) {
      return of([]);
    }
    const queryUrl = this.searchUrlPrefix + encodeURIComponent(keyword) + this.count8;
    this.logger.debug(`requesting ${queryUrl}`);
    return this.getURL(queryUrl).pipe(
      tap(r => this.logger.debug(`search results for ${keyword}`, JSON.stringify(r, null, 2))),
      map(response => response.results),
      catchError((err) => {
        this.logger.error(`caught error when searching ${keyword}`, err);
        return of(new Error('Search Streams Error: ' + err));
      })
    );
  }

}
