/* FeedHandler to, well, handle feeds. */
(function() {

    var streamUrlPrefix = "https://cloud.feedly.com/v3/streams/contents?streamId=";
    // Mix in some trending news
    var trendingUrlPrefix = "https://cloud.feedly.com/v3/mixes/contents?streamId=";
    var countPrefix = "&count=";

    var fetchAll = function(feedList, feedRatio) {
        if(feedRatio === 0) {
            // Latest only
            fetchAllStreams(feedList, 15);
        } else if(feedRatio === 1) {
            // Balanced
            fetchAllStreams(feedList, 8);
            fetchAllTrending(feedList, 7);
        } else if(feedRatio === 2) {
            // Trending only
            fetchAllTrending(feedList, 15);
        }
        window.postMessage({
            target: "FeedController",
            intent: "fetchComplete",
            payload: { size: 15 * feedList.length }
        }, "resource://blink/data/blink_shell.html#/feed");
    }

    /* Fetch all feed streams */
    var fetchAllStreams = function(feedList, count) {
        // FIXME: This might very soon start returning 429 (too many requests)
        // Request only 2 streams (or limited entries) at a time (and use
        // 'Load More' loader)
        console.log("fetching streams...");
        for (i = 0; i < feedList.length; i++) {
            if (feedList[i].wanted)
                fetchById(feedList[i], streamUrlPrefix, count);
        }
    };

    /* Fetch all feed trending */
    var fetchAllTrending = function(feedList, count) {
        // FIXME: This might very soon start returning 429 (too many requests)
        // Request only 2 streams (or limited entries) at a time (and use
        // 'Load More' loader)
        console.log("fetching trends...");
        for (i = 0; i < feedList.length; i++) {
            if (feedList[i].wanted)
                fetchById(feedList[i], trendingUrlPrefix, count);
        }
    };

    /* Fetch feed by streamId */
    var fetchById = function(feedItem, urlPrefix, count) {
        var request = new XMLHttpRequest();
        count = countPrefix + count.toString();
        request.open("GET", urlPrefix + feedItem.streamId + count, true);
        request.onload = function() {
            console.log("[SUCCESS " + request.status + ": " + request.statusText
                + "] fetchById: " + feedItem.streamId);
            window.postMessage({
                target: "FeedController",
                intent: "feedEntries",
                payload: parseFeed(request.responseText, feedItem)
            }, "resource://blink/data/blink_shell.html#/feed");
        };
        request.onerror = function() {
            console.log("[ERROR " + request.status + ": " + request.statusText
                    + "] fetchById: " + feedItem.streamId);
        }

        request.ontimeout = function() {
            console.log("[ERROR " + request.status + ": " + request.statusText
                    + "] fetchById: " + feedItem.streamId);
        }
        request.send();
    };

    /* Create usable object from feed json */
    var parseFeed = function(feedJson, feedItem) {
        var feedObject = JSON.parse(feedJson);
        var urlRegex = new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?");
        // TODO: can use keywords later for suggesting posts
        var hash = hashCode(feedObject.title);

        var entryUrl = function(link, alt) {
            if (urlRegex.test(link))
                return link;
            else return alt;
        };

        var parsedFeed = {
            title: feedObject.title,
            siteUrl: feedItem.websiteUrl,
            iconUrl: feedItem.icon,
            hashCode: hash,
            entries: []
        };

        for (i = 0; i < feedObject.items.length; i++) {
            var contentSnippet = getContentSnippet(feedObject.items[i].summary,
                                    feedObject.items[i].content);
            if (usefulEntry(feedObject.items[i].title, contentSnippet)) {
                parsedFeed.entries.push({
                    entryTitle: feedObject.items[i].title,
                    entryUrl: entryUrl(feedObject.items[i].originId,
                                    feedObject.items[i].alternate[0].href),
                    timestamp: feedObject.items[i].published,
                    coverUrl: getVisualUrl(feedObject.items[i].visual, feedItem.icon),
                    contentSnippet: contentSnippet,
                    flames: getFlames(feedObject.items[i].engagementRate),
                    sourceHash: hash
                });
            }
        }

        return parsedFeed;
    };

    /* Make the content summary readable */
    var getContentSnippet = function(summary, content) {
        // Some feed entries don't have a summary available, some don't have
        // content. So pick whatever is available.
        var snippet = "";
        if (typeof summary === 'undefined')
            if (typeof content === 'undefined')
                return snippet;
            else snippet = content.content;
        else snippet = summary.content;
        // Remove HTML tags
        snippet = snippet.replace(/(<([^>]+)>)/ig, "");
        // Remove \r and \n occurences
        snippet = snippet.replace(/\r?\n/g, "");
        // Replace &quot; with ""
        snippet = snippet.replace(/&quot;/g, '"');
        // Replace all occurences of 'Read More'
        var regex = new RegExp("Read More", 'g');
        snippet = snippet.replace(regex, '');
        // Adding ellipsis
        if (snippet.length > 150) {
            snippet = snippet.substring(0, 150);
            snippet = snippet.substring(0, snippet.lastIndexOf(" ") + 1);
        }
        if (snippet.length === 0)
            snippet = "";
        else snippet += "...";
        return snippet;
    }

    var getFlames = function(er) {
        if (!er || er < 3.5) return 0;
        else if (er > 3.5 && er < 8) return 1;
        else return 2;
    };

    var usefulEntry = function(title, snippet) {
        if (title.length === 0 && snippet.length === 0)
            return false;
        else return true;
    }

    var getVisualUrl = function(img, icon) {
        if (typeof img === 'undefined' || img === 'none')
            return icon;
        else if (typeof img.url === 'undefined' || img.url === 'none')
            return icon;
        else return img.url;
    }

    /* Generate hash code for given string */
    var hashCode = function(s) {
        var hash = 0;
        if (s.length == 0) return hash;
        for (i = 0; i < s.length; i++) {
            char = s.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    }

    var feedHandler = {
        fetchAll: fetchAll,
        fetchById: fetchById
    };

    // HACK: Shouldn't set feedHandler as a window attribute (or should we?)
    // There's gotta be a better way to pass the feedHandler aobject around
    return (window.feedHandler = feedHandler);

}());
