(function() {
    var count = 0;
    /*
    console.log("In feedHandler");
    setInterval(function(){ console.log("In feedHandler " + count); count+=1;}, 3000);
    */
    var feedList= [];
    self.port.on("feedList", function(feed) {
        feedList = feed;
        console.log("got feedlist");
    });

    if(feedList.length == 0 ){
        self.port.emit("getFeed", {});
        console.log("requesting feedlist");
    }

    /* FeedHandler to, well, handle feeds. */
    // TODO: Move handler into another module. Clear things up over here
    var feedHandler = (function() {
        // TODO: For showing trending feed, use 'mixes' instead of 'streams'
        var streamUrlPrefix = "https://cloud.feedly.com/v3/streams/contents?streamId=";
        // TODO: Make this user defined (?) (must be multiple of 3 for better
        // placement of cards)
        var entryCount = "&count=9";

        /* Fetch all feed */
        var fetchAll = function(feedList) {
            // FIXME: This might very soon start returning 429 (too many requests)
            // Request only 2 streams (or limited entries) at a time (and use
            // 'Load More' loader)
            console.log("fetching all...");
            for (i = 0; i < feedList.length; i++) {
                fetchById(feedList[i]);
            }
        };

        /* Fetch feed by streamId */
        var fetchById = function(feedItem) {
            var request = new XMLHttpRequest();
            request.open("GET", streamUrlPrefix + feedItem.streamId + entryCount, true);
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
            // TODO: can use keywords later for suggesting posts
            var hash = hashCode(feedObject.title)
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
                    entryUrl: feedObject.items[i].originId,
                    timestamp: feedObject.items[i].published,
                    coverUrl: feedObject.items[i].visual.url,
                    contentSnippet: getContentSnippet(feedObject.items[i].summary.content),
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
                snippet = snippet.substring(0, 120);
            snippet += "...";
            return snippet;
        }

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



        /* Expose only selected functions */
        return {
            fetchAll: fetchAll,
            fetchById : fetchById   // NOTE: Is there a need to expose this one?
        };
    }());


    var fetchFeed = function(timeout) {
        // Wait for `timeout` secs before decaring 'fetch failure'
        if(timeout == 0 && feedList.length == 0) {
            console.log("Failed to retrieve feedList.");
            return;
        }

        if(feedList.length == 0) {
            setTimeout(function() {
                fetchFeed(timeout - 1);
            }, 1000);
        } else {
        //console.log("Fetching all feed...: " + feedList.length);
        feedHandler.fetchAll(feedList);
        }
    }

    /* Listen for window message events, and process accordingly. */
    window.addEventListener('message', function(event) {
        var message = JSON.parse(event.data);
        if (message.target == "FeedHandler") {
            console.log("Got message for handler");
            var intent = message.intent;
            switch (intent) {
                case "fetch":
                    fetchFeed(3);
                    break;
                case "fetchById":
                    var data = JSON.parse(message.data);
                    feedHandler.fetchById(data.streamId);
                    break;
            }
        }
    }, false);

}());
