import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, delay, mergeMap, tap, map, concatAll, concatMap, combineAll, mergeAll, toArray, take } from 'rxjs/operators';
import { Observable, from, of, empty, forkJoin, concat } from 'rxjs';
import { LoggingService, Logger } from './logging.service';
import { CacheService } from './cache.service';
import { FeedEntry } from '../models/feed-entry';
import { FeedData } from '../models/feed-data';
import { flatten } from '@angular/compiler';

const httpOptions = {
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Content-Type': 'application/json',
    Accept: 'application/json'
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
  private readonly trendingUrlPrefix = 'https://cloud.feedly.com/v3/mixes/contents?streamId=';
  private readonly searchUrlPrefix = 'https://cloud.feedly.com/v3/search/feeds?q=';

  private readonly count7 = '&count=7';
  private readonly count8 = '&count=8';
  private readonly count15 = '&count=15';

  private logger: Logger;

  constructor(private http: HttpClient,
              private loggingService: LoggingService,
              private cacheService: CacheService) {
    this.logger = this.loggingService.getLogger(FeedService.name, LoggingService.Level.Debug);
  }

  private getURL(url: string): Observable<any> {
    // BUG: Doesn't catch ERR_INTERNET_DISCONNECTED
    return this.http.get(url, httpOptions).pipe(
      catchError(err => {
        return of(new Error('HTTP Error: ' + err.message));
      })
    );
  }

  fetchStream(streamID: string, balance: number, randomDelay: number = 50): Observable<any> {
    const urls: string[] = [];
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
    // TODO: retry in case of 429 with backoff
    return from(urls).pipe(
      tap(url => this.logger.debug(`getting ${url}`)),
      delay(Math.ceil(Math.random() * randomDelay) + 100),
      map(url => this.getURL(url).pipe(
        catchError((err) => { this.logger.error('caught error when getting stream:', err); return of(new Error('Streams Error: ' + err)); })
      )),
      combineAll()
    );
  }

  getStreamCached(stream: any, balance: number, randomDelay: number = 100): Observable<FeedData> {
    const streamID = stream.streamId;
    this.logger.debug('getting stream', streamID);
    return this.cacheService.get(streamID).pipe(
      tap(f => this.logger.debug('cache service returned', f)),
      mergeMap((feedCache, _) => {
        if (feedCache === null) {
          this.logger.debug(`cache null for ${streamID}. fetching...`);
          return of(streamID).pipe(
            delay(Math.ceil(Math.random() * randomDelay)),
            mergeMap(s => this.fetchStream(s, balance, randomDelay)),
            tap(feed => this.logger.debug('fetched', feed)),
            map((fetchedFeeds) => {
              const entries = {};
              for (const feed of fetchedFeeds) {
                if (feed instanceof Error) {
                  this.logger.error(`Fetch feed returned error`, feed);
                  continue;
                }
                this.parseEntries(feed, stream).forEach(
                  entry => entries[entry.id] = entry
                );
              }
              return new FeedData(stream.streamId, stream.title, stream.websiteUrl, Object.values(entries));
            }),
            tap(freshFeed => this.cacheService.set(streamID, freshFeed).subscribe()));
        }
        this.logger.debug(`got cache for ${streamID}`);
        return of(feedCache);
      }),
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

  parseEntries(feedObject: any, feedMeta: any): FeedEntry[] {
    // let feedObject = JSON.parse(feedJson);
    const urlRegex = new RegExp('([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?');
    const entryUrl = (link: string, alt: string): string => {
        if (urlRegex.test(link)) {
            return link;
        } else {
          return alt;
        }
    };

    const getVisualUrl = (img: any, icon: string): string => {
      if (typeof img === 'undefined' || img === 'none') {
          return icon;
      } else if (typeof img.url === 'undefined' || img.url === 'none') {
          return icon;
      } else {
        return img.url as string;
      }
    };

    const getFlames = (er: number): number => {
      if (er == null || er < 3.5) {
        return 0;
      } else if (er > 3.5 && er < 8) {
        return 1;
      } else {
        return 2;
      }
    };

    const getContentSnippet = (summary: any, content: any): string => {
      // Some feed entries don't have a summary available, some don't have
      // content. So pick whatever is available.
      let snippet = '';
      if (typeof summary === 'undefined') {
        if (typeof content === 'undefined') {
            return snippet;
        } else {
          snippet = content.content;
        }
      } else {
        snippet = summary.content;
      }
      // Remove HTML tags
      snippet = snippet.replace(/(<([^>]+)>)/ig, '');
      // Remove \r and \n occurences
      snippet = snippet.replace(/\r?\n/g, '');
      // Replace &quot; with ""
      snippet = snippet.replace(/&quot;/g, '"');
      // Replace all occurences of 'Read More'
      const regex = new RegExp('Read More', 'g');
      snippet = snippet.replace(regex, '');
      // Adding ellipsis
      if (snippet.length > 150) {
          snippet = snippet.substring(0, 150);
          snippet = snippet.substring(0, snippet.lastIndexOf(' ') + 1);
      }
      if (snippet.length === 0) {
          snippet = '';
      } else {
        snippet += '...';
      }
      return snippet;
    };

    const isUsefulEntry = (title: string, snippet: string): boolean => {
      if (!(title && snippet) || (title.length === 0 && snippet.length === 0)) {
          return false;
      } else {
        return true;
      }
    };

    const entries = [];

    for (const item of feedObject.items) {
      try {
        const contentSnippet = getContentSnippet(item.summary, item.content);
        if (isUsefulEntry(item.title, contentSnippet)) {
            entries.push(
              new FeedEntry(item.title,
                            entryUrl(item.originId,
                              item.alternate[0].href),
                            getVisualUrl(item.visual, feedMeta.icon),
                            item.published,
                            getFlames(item.engagementRate),
                            contentSnippet,
                            item.id
              )
            );
          }
      } catch (e) {
        this.logger.error('error parsing', item, e);
      }
    }
    return entries;
  }
}
