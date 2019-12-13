import { Component, OnInit } from '@angular/core';
import { StorageService } from 'src/app/services/storage.service';
import { browser } from 'protractor';
import { Logger, LoggingService } from 'src/app/services/logging.service';
import { Settings } from 'src/app/settings';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.css']
})
export class ContentComponent implements OnInit {

  logger: Logger;
  showProgressbar: boolean;
  emptyContentList: boolean;
  contentList: Array<any>;

  constructor(private storage: StorageService, private logging: LoggingService) {
    this.logger = logging.getLogger('ContentComponent', Logger.Level.Info);
   }

  ngOnInit() {
    this.showProgressbar = true;
    this.emptyContentList = false;

    this.storage.get().subscribe((settings) => {
      if (settings instanceof Error) {
        this.showProgressbar = false;
        this.emptyContentList = true;
        // TODO: Add alert
        this.logger.error('failed to get settings', settings);
        return;
      }
      this.showProgressbar = false;
      this.contentList = settings.get(Settings.feedList) || [];
      if (this.contentList.length === 0) {
        this.emptyContentList = true;
      }
    });
  }

  promptDelete(contentSrc) {
    this.logger.debug('deleting', contentSrc);
    // add confirmation dialog here
    // simulating confirmation
    this.deleteItem(contentSrc);
  }

  toggleItem(contentSrc) {
    this.storage.set(new Map([[ Settings.feedList, this.contentList ]])).subscribe(
      _ => this.logger.info(`updated ${contentSrc.title}::${contentSrc.wanted}`)
    );
  }

  deleteItem(toDelete) {
    const index = this.indexOf(toDelete);
    if (index > -1) {
      this.contentList.splice(index, 1);
      this.storage.set(new Map([[ Settings.feedList, this.contentList ]])).subscribe(
        _ => this.logger.info('deleted', toDelete)
      );
      if (this.contentList.length === 0) {
        this.emptyContentList = true;
      }
    }

  }

  // TODO: Move this and other screen-related utils to a service
  columns(): number {
    const w = window.innerWidth;
    if (w > 1200) {
      return 6;
    } else if (w > 768 && w < 1200) {
      return 4;
    } else if (w < 768 && w > 420) {
      return 3;
    } else {
      return 1;
    }
  }

  // TODO: Move this to utils
  range(n: number): Array<number> {
    return new Array<number>(n).fill(0).map((_, i) => i);
  }

  // TODO: Move this to utils
  private indexOf(o) {
    for (let i = 0; i < this.contentList.length; i++) {
        if (this.contentList[i].title === o.title &&
            this.contentList[i].websiteUrl === o.websiteUrl) {
            return i;
        }
    }
    return -1;
  }
}
