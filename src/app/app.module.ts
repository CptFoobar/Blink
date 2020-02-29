import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule, XhrFactory } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HomeComponent } from './components/home/home.component';
import { FeedComponent } from './components/feed/feed.component';
import { WindowScrollComponent } from './components/window-scroll/window-scroll.component';
import { ContentComponent } from './components/content/content.component';
import { SettingsComponent } from './components/settings/settings.component';
import { AboutComponent } from './components/about/about.component';
import { HelpComponent } from './components/help/help.component';
import { BookmarksComponent } from './components/bookmarks/bookmarks.component';
import { HistoryComponent } from './components/history/history.component';
import { ProgressbarComponent } from './components/progressbar/progressbar.component';
import { DeleteContentSourceComponent } from './components/modals/delete-content-source/delete-content-source.component';
import { ToastContainerComponent } from './components/toast-container/toast-container.component';
import { AddContentSourceComponent } from './components/modals/add-content-source/add-content-source.component';
import { LoggingService } from './services/logging.service';
import { SupportComponent } from './components/modals/support/support.component';
import { BrowserXhrFactory } from './services/feed.service';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    HomeComponent,
    FeedComponent,
    WindowScrollComponent,
    ContentComponent,
    SettingsComponent,
    AboutComponent,
    HelpComponent,
    BookmarksComponent,
    HistoryComponent,
    ProgressbarComponent,
    DeleteContentSourceComponent,
    ToastContainerComponent,
    AddContentSourceComponent,
    SupportComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    HttpClientModule,
    FormsModule,
  ],
  providers: [LoggingService, {
    provide: XhrFactory,
    useClass: BrowserXhrFactory
  }],
  // load then modals
  entryComponents: [AddContentSourceComponent, DeleteContentSourceComponent, SupportComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
