(function() {

    /* feedHandler is available here (given by pagemod) */

    var feedList= [];

    self.port.on("feedList", function(feed) {
        feedList = feed;
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

        if(feedList.length == 0) {
            setTimeout(function() {
                fetchAllFeed(timeout - 1);
            }, 1000);
        } else {
        feedHandler.fetchAll(feedList);
        }
    };

    /* Listen for window message events, and process accordingly. */
    window.addEventListener('message', function(event) {
        var message = JSON.parse(event.data);
        if (message.target == "FeedHandler") {
            console.log("Got message for handler");
            var intent = message.intent;
            switch (intent) {
                case "fetch":
                    fetchAllFeed(3);
                    break;
                case "fetchById":
                    var data = JSON.parse(message.data);
                    feedHandler.fetchById(data.streamId);
                    break;
            }
        }
    }, false);

}());
