/* Guess what this manages */
(function() {

    var bookmarks = [];
    self.port.on("bookmarks", function(bookmarksTree) {
        bookmarks = bookmarksTree;
    });

    /* Wrapper for fetching all bookmarks */
    var fetchBookmarks = function(timeout) {
        // Wait for `timeout` secs before declaring 'fetch failure'
        if(timeout == 0 && bookmarks.length == 0) {
            console.log("Failed to retrieve bookmarks.");
            // Inform BookmarksController
            window.postMessage({
                target: "BookmarksController",
                intent: "noBookmarks",
                payload: {}
            }, "resource://blink/data/blink_shell.html#/bookmarks");
            return;
        }

        if(bookmarks.length == 0) {
            setTimeout(function() {
                fetchBookmarks(timeout - 1);
            }, 1000);
        } else {
            window.postMessage({
                target: "BookmarksController",
                intent: "bookmarks",
                payload: { bookmarks: bookmarks }
            }, "resource://blink/data/blink_shell.html#/bookmarks");
        }
    };

    /* Listen for window message events, and process accordingly. */
    window.addEventListener('message', function(event) {
        var message = JSON.parse(event.data);
        if (message.target && message.target == "BookmarksManager") {
            console.log("Got message for BookmarksManager");
            var intent = message.intent;
            switch (intent) {
                case "fetch":
                    bookmarks = [];
                    self.port.emit("getBookmarks", {});
                    fetchBookmarks(3);
                    break;
            }
        }
    }, false);

}());
