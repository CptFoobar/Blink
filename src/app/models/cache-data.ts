import { FeedData } from './feed-data';

export class CacheData {
    cacheKey: string;
    lastSynced: number;
    feedData: FeedData;

    public static generateCacheKey(streamID: string) {
        return encodeURIComponent(streamID);
    }

    constructor(feedData: FeedData, syncTime?: number) {
        this.feedData = feedData;
        this.cacheKey = CacheData.generateCacheKey(feedData.feedID);
        if (syncTime == null) {
            this.lastSynced = new Date().getTime();
        } else {
            this.lastSynced = syncTime;
        }
    }

    toObject() {
        return {
            feedData: {
                feedID: this.feedData.feedID,
                feedURL: this.feedData.feedURL,
                feedTitle: this.feedData.feedTitle,
                entries: this.feedData.entries.map((entry) => entry.toObject()),
            },
            lastSynced: this.lastSynced
        };
    }
}
