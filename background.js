// Set to false for prod
const debugMode = false;

chrome.runtime.onInstalled.addListener(function(details) {
    if ((details.reason == "install" || details.reason == "update") && !debugMode)
        chrome.tabs.create({
            url: chrome.extension.getURL("data/blink_shell.html#/blink/help")
        });
});

// Use sync instead of local, since it falls back to local in case sync is not set
chrome.storage.sync.get(null, function(defaults) {
    // Return on error
    if (chrome.runtime.lastError) {
        log("Error: " + JSON.stringify(chrome.runtime.lastError))
        return;
    }

    if (defaults.userSettings == "undefined" ||
        typeof defaults.userSettings === "undefined") {
        // Set defaults for the extension
        defaults = {
            "userSettings": {
                "showGreeting": true,
                "userName": "User",
                "feedType": "b",
                "shuffleFeed": true
            },
            "feedList": []
        };
        chrome.storage.sync.set(defaults, function() {
            chrome.storage.sync.get(["userSettings", "feedList"], function(data) {
                log(JSON.stringify(data));
            });
            log("Defaults set");
        });
    } else log("Data retrieved: " + JSON.stringify(defaults));

});

/* Util to log if extension is in debug mode */
function log(logMessage) {
    if (debugMode)
        console.log(logMessage);
}
