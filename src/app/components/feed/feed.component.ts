import { FeedService } from './../../services/feed.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css']
})
export class FeedComponent implements OnInit {

  entryList: Array<any>;
  showScroller: boolean;
  emptyFeedList: boolean;
  showProgressbar: boolean;
  timedOut: boolean;

  constructor(private feedService: FeedService) { }

  ngOnInit() {
    this.entryList = this.feedService.getFeed();
    this.showScroller = false;
    this.emptyFeedList = false;
    this.timedOut = false;
    this.showProgressbar = false;
  }

  toTheTop(): void {
    try {
      window.scrollTo({top: 0, left: 0, behavior: 'smooth'});
    } catch (e) {
      window.scrollTo(0, 0);
    }
  }

}
