import { FeedComponent } from './../components/feed/feed.component';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, delay, mergeMap, tap, map } from 'rxjs/operators';
import { Observable, from, of, empty } from 'rxjs';

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

  static readonly FEED_BALANCE_LATEST = 0;
  static readonly FEED_BALANCE_MIX = 1;
  static readonly FEED_BALANCE_TRENDING = 2;

  private readonly streamUrlPrefix = 'https://cloud.feedly.com/v3/streams/contents?streamId=';
  // Mix in some trending news
  private readonly trendingUrlPrefix = 'https://cloud.feedly.com/v3/mixes/contents?streamId=';
  private readonly count15 = '&count=15';
  private readonly count7 = '&count=7';
  private readonly count8 = '&count=8';
  constructor(private http: HttpClient) { }

  getURL(url: string): Observable<any> {
    return this.http.get(url, httpOptions).pipe(
      catchError(err => {
        return of(new Error('HTTP Error: ' + err));
      })
    );
  }

  getStream(streamID: string, balance: number, randomDelay: number = 100): Observable<any> {
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
      tap(url => console.log(`getting ${url}`)),
      delay(Math.floor(Math.random() * randomDelay) + 50),
      mergeMap(url => this.getURL(url).pipe(
        catchError((err) => { console.log('asdf', err); return of(new Error('Streams Error: ' +  err)); })
      ))
    );
  }

}
