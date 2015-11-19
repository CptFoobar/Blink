/* FeedHandler to, well, handle feeds. */
(function() {

    // TODO: For showing trending feed, use 'mixes' instead of 'streams'
    var streamUrlPrefix = "https://cloud.feedly.com/v3/streams/contents?streamId=";
    // Mix in some trending news
    var trendingUrlPrefix = "https://cloud.feedly.com/v3/mixes/contents?streamId=";
    // TODO: Make this user defined (?) (must be multiple of 3 for better
    // placement of cards)
    var streamCount = "&count=9";
    var trendingCount = "&count=6"

    var fetchAll = function(feedList) {
        fetchAllStreams(feedList);
        fetchAllTrending(feedList);
    }

    /* Fetch all feed streams */
    var fetchAllStreams = function(feedList) {
        // FIXME: This might very soon start returning 429 (too many requests)
        // Request only 2 streams (or limited entries) at a time (and use
        // 'Load More' loader)
        console.log("fetching streams...");
        for (i = 0; i < feedList.length; i++) {
            fetchById(feedList[i], streamUrlPrefix, streamCount);
        }
    };

    /* Fetch all feed trending */
    var fetchAllTrending = function(feedList) {
        // FIXME: This might very soon start returning 429 (too many requests)
        // Request only 2 streams (or limited entries) at a time (and use
        // 'Load More' loader)
        console.log("fetching trends...");
        for (i = 0; i < feedList.length; i++) {
            fetchById(feedList[i], trendingUrlPrefix, trendingCount);
        }
    };

    /* Fetch feed by streamId */
    var fetchById = function(feedItem, urlPrefix, count) {
        var request = new XMLHttpRequest();
        request.open("GET", urlPrefix + feedItem.streamId + count, true);
        request.onload = function() {
            window.postMessage({
                target: "FeedController",
                intent: "feedEntries",
                payload: parseFeed(request.responseText, feedItem)
            }, "resource://blink/data/blink_shell.html#/feed");
        };
        // TODO: request.onerror
        request.send();
    };

    /* Create usable object from feed json */
    var parseFeed = function(feedJson, feedItem) {
        var feedObject = JSON.parse(feedJson);
        var urlRegex = new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?");
        // TODO: can use keywords later for suggesting posts
        var hash = hashCode(feedObject.title);

        var entryUrl = function(link, alt) {
            if(urlRegex.test(link))
                return link;
            else return alt;
        };

        var parsedFeed = {
            title : feedObject.title,
            siteUrl : feedItem.websiteUrl,
            iconUrl : feedItem.icon,
            hashCode : hash,
            entries: []
        };

        for (i = 0; i < feedObject.items.length; i++) {
            parsedFeed.entries.push({
                entryTitle: feedObject.items[i].title,
                entryUrl: entryUrl(feedObject.items[i].originId, feedObject.items[i].alternate[0].href),
                timestamp: feedObject.items[i].published,
                coverUrl: getVisualUrl(feedObject.items[i].visual.url),
                contentSnippet: getContentSnippet(feedObject.items[i].summary.content),
                flames: getFlames(feedObject.items[i].engagementRate),
                sourceHash : hash
            });
        }
        //console.log("returned object");
        return parsedFeed;
    };

    /* Make the content summary readable */
    var getContentSnippet = function(snippet) {
        // Remove HTML tags
        snippet = snippet.replace(/(<([^>]+)>)/ig, "");
        // Remove \r and \n occurences
        snippet = snippet.replace(/\r?\n/g, "");
        // Replace &quot; with ""
        snippet = snippet.replace(/&quot;/g,'"');
        // Replace all occurences of 'Read More'
        var regex = new RegExp("Read More", 'g');
        snippet = snippet.replace(regex, '');
        if(snippet.length > 120)
            snippet = snippet.substring(0, 148);
        snippet += "...";
        return snippet;
    }

    var getFlames = function(er) {
        if(er < 3.5) return 0;
        else if(er > 3.5 && er < 8) return 1;
        else return 2;
    };

    var getVisualUrl = function(img) {
        if(img === undefined || img === 'none')
            return "https://unsplash.it/600/480/?random";
        else return img;
    }

    /* Generate hash code for given string */
    var hashCode = function(s){
        var hash = 0;
        if (s.length == 0) return hash;
        for (i = 0; i < s.length; i++) {
            char = s.charCodeAt(i);
            hash = ((hash<<5)-hash)+char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    }

    var feedHandler = {
        fetchAll : fetchAll,
        fetchById : fetchById,
        ping : function(){console.log("Ping received at feedHandler");}
    };

    // HACK: Shouldn't set feedHandler as a window attribute (or should we?)
    // There's gotta be a better way to pass the feedHandler aobject around
    return (window.feedHandler = feedHandler);

}());
