(function() {
    // FeedHandler to, well, handle feeds.
    var feedHandler = (function() {
        // Replace this with a port.emit for getting the feed list
        var url = "https://cloud.feedly.com/v3/mixes/contents?streamId=feed/http://feeds.feedburner.com/Techcrunch";

        var fetch = function() {
            console.log("fetching...");
            var request = new XMLHttpRequest();
            request.open("GET", url, true);
            request.onload = function() {
                console.log("fetched feed, now packing...");
                var jsonResponse = JSON.parse(request.responseText);
                var f = parseFeed(jsonResponse);
                console.log("parsed object is: " + f.toString());
                window.postMessage({
                    target: "FeedController",
                    intent: "feedEntries",
                    data: f
                }, "resource://blink");
            };
            request.send();
        };

        var parseFeed = function(feedObject) {
            // can use keywords later for suggesting posts ;)
            console.log("Parsing feedObject");
            var parsedFeed = {
                title: feedObject.title,
                siteUrl: feedObject.alternate.href,
                entries: []
            };

            for (i = 0; i < feedObject.items.length; i++) {
                parsedFeed.entries.push({
                    entryTitle: feedObject.items[i].title,
                    entryUrl: feedObject.items[i].originId,
                    publishTime: feedObject.items[i].published,
                    coverUrl: feedObject.items[i].visual.url,
                    contentSnippet: feedObject.items[i].summary.content.replace(/(<([^>]+)>)/ig, "")
                });
            }

            return parsedFeed;
        };

        return {
            fetch: fetch
        };
    }());

    // Listen for window message events, and process accordingly.
    window.addEventListener('message', function(event) {
        //console.log("Origin: " + event.origin + " Data: " + event.data);
        var message = JSON.parse(event.data);
        if (message.target == "FeedHandler") {
            var intent = message.intent;
            switch (intent) {
                case "fetch":
                    console.log("Fetching feed...");
                    feedHandler.fetch();
                    break;
                case "fetchSelected":
                    //TODO: Implement fetchFeed(feedId)
                    var data = JSON.parse(message.data);
                    console.log("Fetching feed: " + data.feedId);
                    break;
            }
        } else {
            console.log("Not fetching: " + JSON.parse(event.data).target);
        }
    }, false);
}());
