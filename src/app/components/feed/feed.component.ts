import { UniquePipe } from './../../pipes/unique.pipe';
import { StorageService } from './../../services/storage.service';
import { FeedService } from './../../services/feed.service';
import { Component, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { Subscription, Observable, from, of } from 'rxjs';
import { mergeMap, timeout, catchError, map, tap, filter } from 'rxjs/operators';
import { Settings } from 'src/app/settings';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css']
})
export class FeedComponent implements OnInit, AfterViewInit, OnDestroy {

  entryList: Array<any>;

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

  private readonly fbPrefixURL = 'https://www.facebook.com/sharer/sharer.php?u=';
  private readonly twitterPrefixURL = 'https://twitter.com/intent/tweet?status=';
  private readonly redditPrefixURL = 'https://www.reddit.com/submit?url=';
  private readonly pocketPrefixURL = 'https://getpocket.com/edit?url=';
  private readonly thresholdModifier = 13;

  constructor(private feedService: FeedService, private mediaObserver: MediaObserver,
              private storage: StorageService, private uniquePipe: UniquePipe) { }

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
    this.storage.get().subscribe((settings) => {
      if (settings instanceof Error) {
        // TODO: do something?
        console.log('Error getting settings', settings);
        this.emptyFeedList = true;
        this.showProgressbar = false;
        this.timedOut = false;
        this.allRequestsPending = false;
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

      this.fetchAllFeed(feedList).pipe(
        timeout(10 * 1000),
        catchError((err) => of(new Error('FeedTimeoutError: ' +  err)))
        ).subscribe((feed?: {feedItems: any, feedMeta: any}) => {
          if (!feed) {
            this.minEntryThreshold -= this.thresholdModifier;
            console.log('feed empty');
            return;
          }

          this.addEntries(this.parseFeed(feed.feedItems, feed.feedMeta));
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
  }

  fetchAllFeed(streams: any[]): Observable<any> {
    this.allRequestsPending = true;
    return from(streams).pipe(
      filter(stream => {
        if (!stream.wanted) {
          this.minEntryThreshold -= this.thresholdModifier;
        }
        return stream.wanted;
      }),
      mergeMap(stream => this.feedService.getStream(stream.streamId, this.feedRatio).pipe(
        map(resp => ({ feedItems: resp, feedMeta: stream }))
      )),
      catchError((err) => {
        console.log('Error getting stream:', err);
        // tell the user?
        return of(null);
      })
    );
  }

  parseFeed(feedObject: any, feedMeta: any) {
    // let feedObject = JSON.parse(feedJson);
    let urlRegex = new RegExp('([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?');
    let entryUrl = (link: string, alt: string): string => {
        if (urlRegex.test(link)) {
            return link;
        } else {
          return alt;
        }
    };

    let entries = [];

    for (let item of feedObject.items) {
        let contentSnippet = this.getContentSnippet(item.summary, item.content);
        if (this.isUsefulEntry(item.title, contentSnippet)) {
            entries.push({
                entryTitle: item.title,
                entryUrl: entryUrl(item.originId,
                    item.alternate[0].href),
                timestamp: item.published,
                coverUrl: this.getVisualUrl(item.visual, feedMeta.icon),
                contentSnippet: contentSnippet,
                flames: this.getFlames(item.engagementRate),
                feedSourceTitle: feedMeta.title,
                feedSourceSiteUrl: feedMeta.websiteUrl
            });
        }
    }

    return entries;
  }

  /**
   * Add entries to show
   * @param entries New entries
   */
  addEntries(entries: Array<any>) {
    if (entries.length === 0) {
      if (this.entryList.length >= this.minEntryThreshold) {
        this.showProgressbar = false;
      }
      return;
    }
    // add new entries remove any duplicates. use 'entryTitle' as key
    this.entryList.push.apply(this.entryList, entries);
    let initialEntryCount = this.entryList.length;
    this.entryList = this.uniquePipe.transform(this.entryList, 'entryTitle');
    let uniqueEntryCount = this.entryList.length;
    if (uniqueEntryCount < initialEntryCount) {
      console.log('removed ', initialEntryCount - uniqueEntryCount);
      this.minEntryThreshold -= (initialEntryCount - uniqueEntryCount);
    }

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

  getContentSnippet(summary: any, content: any): string {
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
    let regex = new RegExp('Read More', 'g');
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
  }

  getFlames(er: number) {
    if (!er || er < 3.5) {
      return 0;
    } else if (er > 3.5 && er < 8) {
      return 1;
    } else {
      return 2;
    }
  }

  isUsefulEntry(title: string, snippet: string): boolean {
    if (title.length === 0 && snippet.length === 0) {
        return false;
    } else {
      return true;
    }
  }

  getPublishedTime(time: number): string {
    let diff = new Date().getTime() - time;
    let t = diff / (60 * 60 * 1000); // Calculate hours
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

  getVisualUrl(img: any, icon: string): string {
    if (typeof img === 'undefined' || img === 'none') {
        return icon;
    } else if (typeof img.url === 'undefined' || img.url === 'none') {
        return icon;
    } else {
      return img.url as string;
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
    let h = 500;
    let w = 500;
    let left = (screen.width / 2) - (w / 2);
    let top = (screen.height / 2) - (h / 2);
    return window.open(url, title,
          'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + w + 
            ', height=' + h + ', top=' + top + ', left=' + left);
  }


}