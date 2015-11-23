(function() {

    var history = [];
    var today = [];
    var lastWeek = [];
    var lastMonth = [];
    var older = [];

    self.port.on("history", function(recents) {
        history = recents;
    });

    // If history is empty, ping the add-on process to get it
    if (history.length === 0)
        self.port.emit("getHistory", {});

    /* Wrapper for fetching all history */
    var fetchHistory = function(timeout) {
        // Wait for `timeout` secs before declaring 'fetch failure'
        if (timeout === 0 && history.length === 0) {
            console.log("Failed to retrieve history.");
            return;
        }

        if (history.length == 0) {
            setTimeout(function() {
                fetchHistory(timeout - 1);
            }, 1000);
        } else {
            window.postMessage({
                target: "HistoryController",
                intent: "history",
                payload: sortHistory()
            }, "resource://blink/data/blink_shell.html#/recent");
        }
    };

    /* Sort history in order 'Today', 'Last Week', 'Last Month' and 'Older' */
    var sortHistory = function() {
        var now = new Date().getTime();
        for (let i = 0; i < history.length; i++) {
            if (!history[i].title)
                continue;
            let diff = (now - history[i].time) / 1000;
            if (diff <= 86400)
                today.push(history[i]);
            else if (diff > 86400 && diff <= 604800)
                lastWeek.push(history[i]);
            else if (diff > 604800 && diff <= 18144000)
                lastMonth.push(history[i]);
            else older.push(history[i]);
        }

        return [{
            title: "Today",
            children: today
        }, {
            title: "Last Week",
            children: lastWeek
        }, {
            title: "Last Month",
            children: lastMonth
        }, {
            title: "Older",
            children: older
        }];
    }


    /* Listen for window message events, and process accordingly. */
    window.addEventListener('message', function(event) {
        var message = JSON.parse(event.data);
        if (message.target && message.target == "HistoryManager") {
            console.log("Got message for HistoryManager");
            var intent = message.intent;
            switch (intent) {
                case "fetch":
                    fetchHistory(3);
                    break;
            }
        }
    }, false);

}());
