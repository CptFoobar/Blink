import { UniquePipe } from './../../pipes/unique.pipe';
import { StorageService } from './../../services/storage.service';
import { FeedService } from './../../services/feed.service';
import { Component, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { Subscription, Observable, from, of } from 'rxjs';
import { mergeMap, timeout, catchError, map, tap, filter } from 'rxjs/operators';
import { Settings } from 'src/app/settings';
import { LoggingService, Logger } from 'src/app/services/logging.service';
import { ToastService } from 'src/app/services/toast.service';
import { FeedData } from 'src/app/models/feed-data';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css']
})
export class FeedComponent implements OnInit, AfterViewInit, OnDestroy {

  entryList: FeedData[];

  emptyFeedList: boolean;
  showProgressbar: boolean;
  timedOut: boolean;
  allRequestsPending: boolean;

  shuffleFeed: boolean;
  minEntryThreshold: number;
  feedRatio: number;

  viewCompact: boolean;
  adjustContainer: boolean;
  // Subscription of the observer of the screen size
  mediaQuery$: Subscription;
  // The active media query (xs | sm | md | lg | xl)
  activeMediaQuery: string;
  private logger: Logger;

  private readonly fbPrefixURL = 'https://www.facebook.com/sharer/sharer.php?u=';
  private readonly twitterPrefixURL = 'https://twitter.com/intent/tweet?status=';
  private readonly redditPrefixURL = 'https://www.reddit.com/submit?url=';
  private readonly pocketPrefixURL = 'https://getpocket.com/edit?url=';
  private readonly thresholdModifier = 13;
  private readonly expectedFeedEntries = 15;

  constructor(private feedService: FeedService, private mediaObserver: MediaObserver,
              private storage: StorageService, private logging: LoggingService, private toastService: ToastService) {
    this.logger = this.logging.getLogger(FeedComponent.name, LoggingService.Level.Debug);
  }

  ngOnInit() {
    this.entryList = [];
    this.emptyFeedList = false;
    this.timedOut = false;
    this.showProgressbar = true;
    this.shuffleFeed = true;
    this.allRequestsPending = false;
    this.minEntryThreshold = 0;
    this.adjustContainer = true;
    this.viewCompact = false;
    this.feedRatio = FeedService.FEED_BALANCE_MIX;

    let feedList = [];
    this.storage.getSync().subscribe((settings) => {
      if (settings instanceof Error) {
        this.logger.error('Error getting settings', settings);
        this.emptyFeedList = true;
        this.showProgressbar = false;
        this.timedOut = false;
        this.allRequestsPending = false;
        this.toastService.showError('An error occurred when reading your settings.');
        return;
      }
      feedList = settings.get(Settings.feedList) || [];
      this.shuffleFeed = settings.get(Settings.userSettings).shuffleFeed;
      this.viewCompact = settings.get(Settings.userSettings).feedViewCompact;
      switch (settings.get(Settings.userSettings).feedType) {
        case 'l':
          this.feedRatio = FeedService.FEED_BALANCE_LATEST;
          break;
        case 'b':
          this.feedRatio = FeedService.FEED_BALANCE_MIX;
          break;
        case 't':
          this.feedRatio = FeedService.FEED_BALANCE_TRENDING;
          break;
        default:
          this.feedRatio = FeedService.FEED_BALANCE_MIX;
          break;
      }

      if (feedList.length === 0) {
        this.emptyFeedList = true;
        this.showProgressbar = false;
        this.timedOut = false;
        this.allRequestsPending = false;
        return;
      }

      this.minEntryThreshold = feedList.length * 13;

      this.fetchAllFeed(feedList).pipe(
        timeout(10 * 1000),
        catchError((err) => of(new Error('FeedTimeoutError: ' +  err)))
        ).subscribe((feed: FeedData) => {
          this.logger.debug('got feed data', feed);
          this.addEntries(feed);
        },
        (err) => {
          // show error to user if no requests have returned for 10s or if all requests failed and there is nothing to show
          if (this.allRequestsPending || (this.minEntryThreshold <= 0 && this.entryList.length === 0)) {
            this.showProgressbar = false;
            this.timedOut = true;
            this.emptyFeedList = true;
            this.allRequestsPending = false;
          }
      }, () => {
        this.allRequestsPending = false;
        this.timedOut = false;
      });
    });
  }

  ngAfterViewInit() {

    this.mediaQuery$ = this.mediaObserver.media$.subscribe((change: MediaChange) => {
      this.activeMediaQuery = change ? `'${change.mqAlias}' = (${change.mediaQuery})` : '';
      if ( ['md', 'sm'].indexOf(change.mqAlias) > -1 && window.innerWidth < 1000) {
         this.adjustContainer = true;
      } else {
        this.adjustContainer = false;
      }
    });
  }

  ngOnDestroy() {
    this.mediaQuery$.unsubscribe();
    this.toastService.clear();
  }

  fetchAllFeed(streams: any[]): Observable<FeedData> {
    this.allRequestsPending = true;
    return from(streams).pipe(
      filter(stream => {
        if (!stream.wanted) {
          this.minEntryThreshold -= this.thresholdModifier;
        }
        return stream.wanted;
      }),
      mergeMap(stream =>
        this.feedService.getStreamCached(stream, this.feedRatio)
      ),
      catchError((err) => {
        this.logger.error('Error getting stream:', err);
        // tell the user?
        return of(null);
      })
    );
  }

  /**
   * Add entries to show
   * @param entries New entries
   */
  addEntries(feedData: FeedData) {
    if (feedData.entries.length === 0) {
      this.logger.info(`feed empty for ${feedData.feedTitle}`);
      this.minEntryThreshold -= this.thresholdModifier;
      if (this.entryList.length >= this.minEntryThreshold) {
        this.showProgressbar = false;
      }
      return;
    }
    // add new entries remove any duplicates. use 'entryTitle' as key
    this.entryList.push.apply(this.entryList, feedData.entries.map(e => ({
        entryTitle: e.title,
        entryUrl: e.url,
        timestamp: e.timestamp,
        coverUrl: e.cover,
        contentSnippet: e.snippet,
        flames: e.flames,
        feedSourceTitle: feedData.feedTitle,
        feedSourceSiteUrl: feedData.feedURL
    })));
    this.minEntryThreshold -= (this.expectedFeedEntries - feedData.entries.length);

    if (this.shuffleFeed) {
      this.entryList = this.shuffle(this.entryList);
    }
    this.timedOut = false;
    this.emptyFeedList = false;
    this.allRequestsPending = false;
    if (this.entryList.length >= this.minEntryThreshold) {
        this.showProgressbar = false;
    }
  }

  getPublishedTime(time: number): string {
    const diff = new Date().getTime() - time;
    const t = diff / (60 * 60 * 1000); // Calculate hours
    if (t >= 1 && t < 24) {
      return Math.floor(t).toString() +
        (Math.floor(t) === 1 ? ' hr ago' : ' hrs ago');
    } else if (t < 1) {
      return Math.floor(t * 60).toString() +
        (Math.floor(t * 60) ? ' min ago' : ' mins ago');
    } else {
      return Math.floor(t / 24).toString() +
        (Math.floor(t / 24) ? ' day ago' : ' days ago');
    }
  }

  // TODO: Move this and other screen-related utils to a service
  columns(): number {
    const w = window.innerWidth;
    if (w > 1600) {
      if (this.viewCompact) {
        return 4;
      } else {
        return 3;
      }
    } else if (w > 1200 && w < 1600) {
      if (this.viewCompact) {
        return 4;
      } else {
        return 3;
      }
    } else if (w > 768 && w < 1200) {
      return 3;
    } else if (w < 768 && w > 420) {
      return 2;
    } else {
      return 1;
    }
  }

  /* Fischer-Yates aka Knuth shuffle */
  shuffle(items: Array<any>) {
    let currentIndex = items.length;
    let  temporaryValue;
    let randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = items[currentIndex];
      items[currentIndex] = items[randomIndex];
      items[randomIndex] = temporaryValue;
    }

    return items;
  }

  // TODO: Move this to utils
  range(n: number): Array<number> {
    return new Array<number>(n).fill(0).map((_, i) => i);
  }

  popup(sharePoint: string, suffix: string) {
    let url;
    let title;
    switch (sharePoint) {
        case 'f':
            url = this.fbPrefixURL;
            title = 'Share on Facebook';
            break;
        case 't':
            url = this.twitterPrefixURL;
            title = 'Share on Twitter';
            break;
        case 'r':
            url = this.redditPrefixURL;
            title = 'Share on Reddit';
            break;
        case 'p':
            url = this.pocketPrefixURL;
            title = 'Save to Pocket';
            break;
    }
    url = url + suffix;
    const h = 500;
    const w = 500;
    const left = (screen.width / 2) - (w / 2);
    const top = (screen.height / 2) - (h / 2);
    return window.open(url, title,
          'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + w + 
            ', height=' + h + ', top=' + top + ', left=' + left);
  }


}
