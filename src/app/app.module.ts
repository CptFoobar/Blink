import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HomeComponent } from './components/home/home.component';
import { FeedComponent } from './components/feed/feed.component';
import { WindowScrollComponent } from './components/window-scroll/window-scroll.component';
import { UniquePipe } from './pipes/unique.pipe';
import { ContentComponent } from './components/content/content.component';
import { SettingsComponent } from './components/settings/settings.component';
import { AboutComponent } from './components/about/about.component';
import { HelpComponent } from './components/help/help.component';
import { BookmarksComponent } from './components/bookmarks/bookmarks.component';
import { HistoryComponent } from './components/history/history.component';
import { ProgressbarComponent } from './components/progressbar/progressbar.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    HomeComponent,
    FeedComponent,
    WindowScrollComponent,
    UniquePipe,
    ContentComponent,
    SettingsComponent,
    AboutComponent,
    HelpComponent,
    BookmarksComponent,
    HistoryComponent,
    ProgressbarComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [UniquePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
