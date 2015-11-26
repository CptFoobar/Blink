/* Manage user's feed sources */
(function() {

    var contentList = [];
    self.port.on("contentList", function(content) {
        contentList = content;
    });
    // If contentList is empty, ping the add-on process to get it
    if (contentList.length == 0)
        self.port.emit("getContentList", {});

    // FIXME: DRY in managers
    // The code below this line (fetchcontentList and the window listener)
    // is being repeated in every *Manager.js file. Maybe we can move this
    // message filtering to another module? (DRY ya know)

    /* Wrapper for fetching all contentList */
    var fetchContentList = function(timeout) {
        // Wait for `timeout` secs before declaring 'fetch failure'
        if(timeout == 0 && contentList.length == 0) {
            console.log("Failed to retrieve contentList.");
            return;
        }

        if(contentList.length == 0) {
            setTimeout(function() {
                fetchContentList(timeout - 1);
            }, 1000);
        } else {
            console.log("Posting contentList");
            window.postMessage({
                target: "ContentController",
                intent: "contentList",
                payload: contentList
            }, "resource://blink/data/blink_shell.html#/blink/content");
        }
    };


    /* Listen for window message events, and process accordingly. */
    window.addEventListener('message', function(event) {
        var message = JSON.parse(event.data);
        if (message.target && message.target == "ContentManager") {
            console.log("Got message for ContentManager");
            var intent = message.intent;
            switch (intent) {
                case "fetch":
                    fetchContentList(3);
                    break;
            }
        }
    }, false);


}());
