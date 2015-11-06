// Basics
const self = require('sdk/self');
const data = self.data;
const pageMod = require("sdk/page-mod");
const tabs = require("sdk/tabs");

// Storage and permissions
const {when: unload} = require("sdk/system/unload");
const prefSet = require("sdk/simple-prefs");
const ss = require("sdk/simple-storage");
const services = require("sdk/preferences/service");
const browserWindows = require("sdk/windows").browserWindows;

// For  setting new tab URL
const fx38 = require(data.url("js/fx38.js"));
const NewTabURL = require('resource:///modules/NewTabURL.jsm').NewTabURL;

var oldNewTab;
var blinkEnable = prefSet.prefs.blinkEnable;
var devlogs = true; // set true to enable logging
var feedList = [];

const useNewAPI = require("sdk/system").version >= "41.0";

var newTabURL = data.url("blink_shell.html");
// TODO: Add other urls to be hidden into a list

// Get and save original new tab
oldNewTab = getOriginalNewTab();

// Init Blink
blinkInit();

// Init Blink on new windows when they open
browserWindows.on("open", blinkInit);

// Set preference change listener
prefSet.on("blinkEnable", onPrefChange);

// Clear settings on Unload. (Redundant?)
unload(function() {
    clearSettings();
});

/* Clear settings on disable/uninstall.
   But due to bug https://bugzilla.mozilla.org/show_bug.cgi?id=627432#c12,
   uninstall is never called */
exports.onUnload = function(reason) {
    if (reason === "disable" || reason === "uninstall")
        clearSettings();
};

/* Returns original new tab. If none found, returns default new tab */
function getOriginalNewTab() {
    var ont;
    if (self.loadReason == "install" || self.loadReason == "enable") {
        ont = services.get("browser.newtab.url");
        ss.storage.originalNewTab = ont;
    } else {
        ont = ss.storage.originalNewTab;
    }

    ont = ont ? ont : "about:newtab";

    Log("oldNewTab: " + ont);

    return ont;
};

/* Init function. Da bomb. */
function blinkInit() {
    if (blinkEnable) {
        if (useNewAPI) {
            Log("Using new API")
            NewTabURL.override(newTabURL);
        } else {
            Log("Using old API")
            fx38.setNewTabUrl(newTabURL);
        }

        initConfig();

        // Set PageMod
        pageMod.PageMod({
            include: "resource://blink/data/blink_shell.html",
            contentScriptFile: data.url("js/feedHandler.js"),
            contentScriptWhen: 'end',
            onAttach: function(worker) {
                worker.port.emit("feedList", feedList);
                console.log("emmitting");
            }
        });
    }
};

/* Clear the settings we changed */
function clearSettings() {
    if (useNewAPI) {
        Log("Clearing the new way");
        NewTabURL.override(oldNewTab);
    } else {
        Log("Clearing the old way");
        fx38.reset(oldNewTab);
    }
    browserWindows.removeListener("open", blinkInit);
};

/* Preference change handler */
function onPrefChange(prefName) {
    if (prefName == "blinkEnable") {
        blinkEnable = prefSet.prefs.blinkEnable;
        if (blinkEnable)
            blinkInit();
        else
            clearSettings();
    }
};

/* Initialise configuration with user-set preferences and feed list */
function initConfig() {
    // TODO: Use simple storage to store feeds
    // TODO: Add icon and feed name into objects in this list.
    // NOTE: haven't been able to get feeds/:feed_id to work
    feedList = [{
        streamId : "feed/http://www.engadget.com/rss-full.xml"
    },{
        streamId : "feed/http://feeds.feedburner.com/Techcrunch"
    }];
}

/* util for debugging */
function Log(log) {
    if (devlogs) console.log(log);
}
