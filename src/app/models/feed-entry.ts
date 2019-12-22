export class FeedEntry {
    title: string;
    url: string;
    cover: string;
    timestamp: number;
    flames: number;
    snippet: string;
    id: string;

    constructor(title: string,
                url: string,
                cover: string,
                timestamp: number,
                flames: number,
                snippet: string,
                id?: string) {
        this.title = title;
        this.url = url;
        this.cover = cover;
        this.timestamp = timestamp;
        this.flames = flames;
        this.snippet = snippet;
        this.id = id || '00000';
    }

    toObject() {
        return {
            title: this.title,
            url: this.url,
            cover: this.cover,
            timestamp: this.timestamp,
            flames: this.flames,
            snippet: this.snippet
        };
    }
}
