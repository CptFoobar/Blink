/* Manage user's feed sources */
(function() {

    var userSettings = [];
    self.port.on("userSettings", function(content) {
        userSettings = content;
    });

    /* Wrapper for fetching all userSettings */
    var fetchUserSettings = function(timeout) {
        // Wait for `timeout` secs before declaring 'fetch failure'
        if(timeout == 0 && userSettings.length == 0) {
            // console.log("Failed to retrieve userSettings.");
            return;
        }

        if(userSettings.length == 0) {
            setTimeout(function() {
                fetchUserSettings(timeout - 1);
            }, 1000);
        } else {
            // console.log("Posting userSettings");
            window.postMessage({
                target: "SettingsController",
                intent: "config",
                payload: {config: userSettings}
            }, "resource://blink/data/blink_shell.html#/blink/settings");
        }
    };


    var saveSettings = function(settings) {
        self.port.emit("saveUserSettings", settings);
    }

    /* Listen for window message events, and process accordingly. */
    window.addEventListener('message', function(event) {
        var message = JSON.parse(event.data);
        if (message.target && message.target == "SettingsManager") {
            // console.log("Got message for SettingsManager");
            var intent = message.intent;
            switch (intent) {
                case "getConfig":
                    // console.log("fetch user settings request");
                    userSettings = [];
                    self.port.emit("getUserSettings", {});
                    fetchUserSettings(3);
                    break;
                case "saveConfig":
                    // console.log("save user settings request");
                    saveSettings(message.payload.config);
                    break;
            }
        }
    }, false);


}());
