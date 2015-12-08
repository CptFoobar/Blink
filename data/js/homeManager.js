(function(){

    var homeConfig = {};

    self.port.on("homeConfig", function(cfg) {
        homeConfig = cfg;
    });

    // If history is empty, ping the add-on process to get it
    if (typeof homeConfig.showGreeting === 'undefined')
        self.port.emit("getHomeConfig", {});


    /* Wrapper for fetching homeConfig */
    var fetchHomeConfig = function(timeout) {
        // Wait for `timeout` secs before declaring 'fetch failure'
        if (timeout === 0 && typeof homeConfig.showGreeting === 'undefined') {
            console.log("Failed to retrieve homeConfig.");
            return;
        }

        if (typeof homeConfig.showGreeting === 'undefined') {
            setTimeout(function() {
                fetchHomeConfig(timeout - 1);
            }, 1000);
        } else {
            window.postMessage({
                target: "HomeController",
                intent: "homeConfig",
                payload: {config: homeConfig}
            }, "resource://blink/data/blink_shell.html#/home");
        }
    };

    var HomeListener = function(event) {
        var message = JSON.parse(event.data);
        if (message.target && message.target == "HomeManager") {
            console.log("Got message for HomeManager");
            var intent = message.intent;
            switch (intent) {
                case "getHomeConfig":
                    fetchHomeConfig(3);
                    break;
            }
        }
    };

    window.addEventListener('message', HomeListener, false);

}());
