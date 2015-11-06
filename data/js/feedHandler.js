(function() {

    var feedList= [];
    self.port.on("feedList", function(feed) {
        feedList = feed;
    });

    /* FeedHandler to, well, handle feeds. */
    var feedHandler = (function() {

        var streamUrlPrefix = "https://cloud.feedly.com/v3/mixes/contents?streamId=";
        // TODO: Make this user defined (?) (must be multiple of 3 for better
        // placement of cards)
        var entryCount = "&count=9";

        /* Fetch all feed */
        var fetchAll = function(feedList) {
            // FIXME: This might very soon start returning 429 (too many requests)
            // Request only 2 streams at a time (and use 'Load More' loader?)
            for (i = 0; i < feedList.length; i++) {
                fetchById(feedList[i].streamId);
            }
        };

        /* Fetch feed by streamId */
        var fetchById = function(streamId) {
            var request = new XMLHttpRequest();
            request.open("GET", streamUrlPrefix + streamId + entryCount, true);
            request.onload = function() {
                window.postMessage({
                    target: "FeedController",
                    intent: "feedEntries",
                    payload: parseFeed(request.responseText)
                }, "resource://blink/data/blink_shell.html#/feed");
            };
            // TODO: request.onerror
            request.send();
        };

        /* Create usable object from feed json */
        var parseFeed = function(feedJson) {
            var feedObject = JSON.parse(feedJson);
            // TODO: can use keywords later for suggesting posts
            var parsedFeed = {
                title: feedObject.title,
                siteUrl: feedObject.alternate.href,
                entries: []
            };

            for (i = 0; i < feedObject.items.length; i++) {
                parsedFeed.entries.push({
                    entryTitle: feedObject.items[i].title,
                    entryUrl: feedObject.items[i].originId,
                    timestamp: feedObject.items[i].published,
                    coverUrl: feedObject.items[i].visual.url,
                    contentSnippet: getContentSnippet(feedObject.items[i].summary.content)
                });
            }

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
                snippet = snippet.substring(0, 120);
            snippet += "...";
            return snippet;
        }

        /* Expose only selected functions */
        return {
            fetchAll: fetchAll,
            fetchById : fetchById   // FFT: Is there a need to expose this one?
        };
    }());

    /* Listen for window message events, and process accordingly. */
    window.addEventListener('message', function(event) {
        var message = JSON.parse(event.data);
        if (message.target == "FeedHandler") {
            var intent = message.intent;
            switch (intent) {
                case "fetch":
                    console.log("Fetching all feed...: " + feedList.length);
                    feedHandler.fetchAll(feedList);
                    break;
                case "fetchById":
                    var data = JSON.parse(message.data);
                    feedHandler.fetchById(data.streamId);
                    break;
            }
        }
    }, false);

}());
