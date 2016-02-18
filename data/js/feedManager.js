(function() {

    /* feedHandler is available here (given by pagemod) */

    var feedList= [];
    var feedRatio = -1; // 0-latest, 1-balanced, 2-trending
    self.port.on("feedList", function(feed) {
        feedList = feed;
    });

    self.port.on("feedRatio", function(ratio) {
        ratio = ratio.feedRatio;
        if(ratio === 'l') feedRatio = 0;
        else if(ratio === 't') feedRatio = 2;
        else feedRatio = 1;
    });

    /* Wrapper for fetching all feed */
    var fetchAllFeed = function(timeout) {
        // Wait for `timeout` secs before declaring 'fetch failure'
        if(timeout == 0 && feedList.length == 0) {
            // Inform FeedController
            window.postMessage({
                target: "FeedController",
                intent: "emptyFeedList",
                payload: {}
            }, "resource://blink/data/blink_shell.html#/feed");
            // console.log("Failed to retrieve feedList.");
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
            // console.log("Got message for FeedManager");
            var intent = message.intent;
            switch (intent) {
                case "fetch":
                    feedRatio = -1;
                    feedList = [];
                    self.port.emit("getFeed", {});
                    self.port.emit("getFeedConfig", {});
                    fetchAllFeed(3);
                    break;
            }
        }
    }, false);

}());
