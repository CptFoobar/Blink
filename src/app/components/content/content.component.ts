import { Component, OnInit } from '@angular/core';
import { StorageService } from 'src/app/services/storage.service';
import { browser } from 'protractor';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.css']
})
export class ContentComponent implements OnInit {

  showProgressbar: boolean;
  emptyContentList: boolean;
  contentList: Array<any>;

  private readonly fieldListKey = 'feedList';

  constructor(private storage: StorageService) { }

  ngOnInit() {
    this.showProgressbar = true;
    this.emptyContentList = false;

    this.storage.get().subscribe((settings) => {
      if (settings instanceof Error) {
        this.showProgressbar = false;
        this.emptyContentList = true;
        // TODO: Add alert
        console.log('failed to get settings', settings);
        return;
      }
      this.showProgressbar = false;
      this.contentList = settings.get('feedList') || [];
      if (this.contentList.length === 0) {
        this.emptyContentList = true;
      }
    });
  }

  promptDelete(contentSrc) {
    console.log('deleting', contentSrc);
  }

  toggleItem(contentSrc) {
    console.log('saving: ', contentSrc.wanted);
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

}
