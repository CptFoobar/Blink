import { Component, OnInit } from '@angular/core';
import { StorageService } from 'src/app/services/storage.service';
import { Logger, LoggingService } from 'src/app/services/logging.service';
import { Settings } from 'src/app/settings';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DeleteContentSourceComponent } from '../modals/delete-content-source/delete-content-source.component';
import { ToastService } from 'src/app/services/toast.service';
import { AddContentSourceComponent } from '../modals/add-content-source/add-content-source.component';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.css']
})
export class ContentComponent implements OnInit {

  logger: Logger;
  showProgressbar: boolean;
  // TODO: Can remove emptyContentList by simply using contentList.length()
  emptyContentList: boolean;
  contentList: Array<any>;
  closeResult: string;

  constructor(private storage: StorageService,
              private logging: LoggingService,
              private modalService: NgbModal,
              public toastService: ToastService) {
    this.logger = logging.getLogger(ContentComponent.name, Logger.Level.Info);
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
    const modalRef = this.modalService.open(DeleteContentSourceComponent, { size: 'lg', windowClass: 'modal-lg-compact' });
    modalRef.componentInstance.title = contentSrc.title;
    modalRef.componentInstance.icon = contentSrc.icon;
    modalRef.result.then((deleteConfirmed) => {
      this.deleteItem(contentSrc);
    }, (dismissed) => {
      this.logger.debug(`Dismissed deleting ${contentSrc.title}`);
    });
  }

  toggleItem(contentSrc) {
    this.updateFeedlist();
  }

  deleteItem(toDelete) {
    const index = this.indexOf(toDelete);
    if (index > -1) {
      this.contentList.splice(index, 1);
      this.updateFeedlist(`Deleted '${toDelete.title}' from your feed`, `Failed to delete '${toDelete.title}' from your feed`);
      if (this.contentList.length === 0) {
        this.emptyContentList = true;
      }
    }
  }

  updateFeedlist(successToastMsg?: string, errToastMsg?: string) {
    this.storage.set(new Map([[ Settings.feedList, this.contentList ]])).subscribe(
      err => {
        if (err) {
          if (errToastMsg) {
            this.toastService.showError(errToastMsg);
          }
          this.logger.error('An error occurred when updating feed list.', err);
        } else {
          if (successToastMsg) {
            this.toastService.showSuccess(successToastMsg);
          }
        }
      }
    );
  }

  addContent() {
    const modalRef = this.modalService.open(AddContentSourceComponent, { size: 'xl' });
    modalRef.result.then((newSource) => {
      this.logger.info('adding', newSource);
      const newFeedItem = {
        title: newSource.title,
        websiteUrl: newSource.website,
        streamId: newSource.feedId,
        icon: newSource.visualUrl,
        description: newSource.description,
        tags: newSource.deliciousTags,
        wanted: true
      };
      if (this.indexOf(newFeedItem) === -1) {
        this.contentList.push(newFeedItem);
        this.updateFeedlist(`Added ${newFeedItem.title} to your feed!`, `Failed to add ${newFeedItem.title} to your feed.`);
      }
    });
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


  rows(): number {
    this.logger.debug('rows', this.contentList);
    if (!this.contentList) { return 0; }
    return Math.ceil((this.contentList.length) / this.columns());
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
