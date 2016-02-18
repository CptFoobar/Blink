/* Manage user's feed sources */
(function() {

    var contentList = [];
    self.port.on("contentList", function(content) {
        contentList = content;
    });

    /* Wrapper for fetching all contentList */
    var fetchContentList = function(timeout) {
        // Wait for `timeout` secs before declaring 'fetch failure'
        if(timeout == 0 && contentList.length == 0) {
            // console.log("Failed to retrieve contentList.");
            window.postMessage({
                target: "ContentController",
                intent: "emptyContentList",
                payload: {}
            }, "resource://blink/data/blink_shell.html#/blink/content");
            return;
        }

        if(contentList.length == 0) {
            setTimeout(function() {
                fetchContentList(timeout - 1);
            }, 1000);
        } else {
            // console.log("Posting contentList");
            window.postMessage({
                target: "ContentController",
                intent: "contentList",
                payload: contentList
            }, "resource://blink/data/blink_shell.html#/blink/content");
        }
    };

    var getAutocompleteSuggestions = function(query) {
        var request = new XMLHttpRequest();
        var completeQuery = "https://cloud.feedly.com/v3/search/feeds?q="
                                + query + "&count=12";
        request.open("GET", completeQuery, true);
        request.onload = function() {
            window.postMessage({
                target: "ContentController",
                intent: "suggestionList",
                payload: JSON.parse(request.responseText).results
            }, "resource://blink/data/blink_shell.html#/blink/content");
        };
        // TODO: request.onerror. Priority: 3
        request.send();
    };

    var addSourceItem = function(item) {
        self.port.emit("addSourceItem", item);
    }

    var deleteSourceItem = function(item) {
        self.port.emit("deleteSourceItem", item);
    }

    var toggleSourceItem = function(item) {
        self.port.emit("toggleSourceItem", item);
    }

    /* Listen for window message events, and process accordingly. */
    window.addEventListener('message', function(event) {
        var message = JSON.parse(event.data);
        if (message.target && message.target == "ContentManager") {
            // console.log("Got message for ContentManager");
            var intent = message.intent;
            switch (intent) {
                case "fetch":
                    // console.log("fetch request");
                    contentList = [];
                    self.port.emit("getContentList", {});
                    fetchContentList(3);
                    break;
                case "search":
                    // console.log("search request");
                    getAutocompleteSuggestions(message.payload.query);
                    break;
                case "add":
                    // console.log("add request");
                    addSourceItem(message.payload.addItem);
                    break;
                case "delete":
                    // console.log("delete request");
                    deleteSourceItem(message.payload.removeItem);
                    break;
                case "toggle":
                    // console.log("toggle request");
                    toggleSourceItem(message.payload.toggleItem)
                    break;
            }
        }
    }, false);


}());
