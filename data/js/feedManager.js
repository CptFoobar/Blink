(function() {

    /* feedHandler is available here (given by pagemod) */

    var feedList= [];
    var feedRatio = -1; // 0-latest, 1-balanced, 2-trending
    self.port.on("feedList", function(feed) {
        feedList = feed;
    });

    self.port.on("feedRatio", function(ratio) {
        ratio = ratio.feedRatio;
        console.log("Feed ratio: " + ratio);
        if(ratio === 'l') feedRatio = 0;
        else if(ratio === 't') feedRatio = 2;
        else feedRatio = 1;
    });

    // If feedList is empty, ping the add-on process to get it
    if(feedList.length == 0)
        self.port.emit("getFeed", {});

    /* Wrapper for fetching all feed */
    var fetchAllFeed = function(timeout) {
        // Wait for `timeout` secs before declaring 'fetch failure'
        if(timeout == 0 && feedList.length == 0) {
            // TODO: Inform FeedController about this devastating turn of events
            console.log("Failed to retrieve feedList.");
            return;
        }

        if(feedList.length == 0 || feedRatio === -1) {
            setTimeout(function() {
                fetchAllFeed(timeout - 1);
            }, 1000);
        } else {
            feedHandler.fetchAll(feedList, feedRatio);
        }
    };

    /* Listen for window message events, and process accordingly. */
    window.addEventListener('message', function(event) {
        var message = JSON.parse(event.data);
        if (message.target && message.target == "FeedManager") {
            console.log("Got message for FeedManager");
            var intent = message.intent;
            switch (intent) {
                case "fetch":
                    feedRatio = -1;
                    self.port.emit("getFeedConfig", {});
                    fetchAllFeed(4);
                    break;
            }
        }
    }, false);

}());
