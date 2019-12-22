import { FeedEntry } from './feed-entry';

export class FeedData {
    feedID: string;
    feedTitle: string;
    feedURL: string;
    entries: Array<FeedEntry>;

    constructor( feedID: string,
                 feedTitle: string,
                 feedURL: string,
                 entries: Array<FeedEntry>) {
        this.feedTitle = feedTitle;
        this.feedID = feedID;
        this.feedURL = feedURL;
        this.entries = entries;
    }
}
