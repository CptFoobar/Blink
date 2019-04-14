import { BookmarksComponent } from './components/bookmarks/bookmarks.component';
import { AboutComponent } from './components/about/about.component';
import { HelpComponent } from './components/help/help.component';
import { SettingsComponent } from './components/settings/settings.component';
import { ContentComponent } from './components/content/content.component';
import { FeedComponent } from './components/feed/feed.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { HistoryComponent } from './components/history/history.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'feed', component: FeedComponent },
  { path: 'recent', component: HistoryComponent },
  { path: 'bookmarks', component: BookmarksComponent },
  { path: 'blink/content', component: ContentComponent },
  { path: 'blink/settings', component: SettingsComponent },
  { path: 'blink/help', component: HelpComponent },
  { path: 'blink/about', component: AboutComponent },
  { path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
