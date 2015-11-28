// Basics
const self = require('sdk/self');
const data = self.data;
const pageMod = require("sdk/page-mod");
const tabs = require("sdk/tabs");

// Storage and permissions
const { when: unload } = require("sdk/system/unload");
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
var bookmarksTree = [];
var bookmarks = [];

const useNewAPI = require("sdk/system").version >= "41.0";

var newTabURL = data.url("blink_shell.html");
newTabURL = newTabURL + "#/home";
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

// TODO: MIGRATION FOR UPGRADERS!!

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

        // Set PageMods
        setPageMods();
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

/* Set PageMods */
function setPageMods() {
    // PageMod for feed page
    pageMod.PageMod({
        include: "resource://blink/data/*",
        contentScriptFile: [data.url("js/feedHandler.js"),
                            data.url("js/feedManager.js")],
        contentScriptWhen: 'ready',
        onAttach: function(worker) {
            worker.port.on("getFeed", function(nothing) {
                worker.port.emit("feedList", feedList);
                Log("Emmitting feedlist");
            });
        }
    });

    // PageMod for bookmarks
    pageMod.PageMod({
        include: "resource://blink/data/*",
        contentScriptFile: data.url("js/bookmarksManager.js"),
        contentScriptWhen: 'ready',
        onAttach: function(worker) {
            worker.port.on("getBookmarks", function(nothing) {
                worker.port.emit("bookmarks", bookmarksTree);
                Log("Emmitting bookmarks");
            });
        }
    });

    // PageMod for content
    pageMod.PageMod({
        include: "resource://blink/data/*",
        contentScriptFile: data.url("js/contentManager.js"),
        contentScriptWhen: 'ready',
        onAttach: function(worker) {
            worker.port.on("getContentList", function(nothing) {
                worker.port.emit("contentList", feedList);
                Log("Emmitting contentlist");
            });
            worker.port.on("addSourceItem", function(item) {
                feedList.push(item);
                updateFeed();
            });
            worker.port.on("deleteSourceItem", function(item) {
                var index = indexOf(item);
                if (index >= 0) {
                    feedList.splice(index, 1);
                    updateFeed();
                }
            });
        }
    });
}

/* Initialise configuration with user-set preferences and feed list */
function initConfig() {
    if (self.loadReason == "install" || !ss.storage.feedList) {
        feedList = ["alpha"];
        ss.storage.feedList = feedList;
    } else {
        feedList = ss.storage.feedList;
    }
    getBookmarks();
    getHistory();
}

// For testing only.
makeFeed([{
    title: "Engadget",
    websiteUrl: "http://www.engadget.com",
    streamId: "feed/http://www.engadget.com/rss-full.xml",
    icon: "http://storage.googleapis.com/site-assets/4i-1vhCwmRRLfmB7ypTnMh-ZKSvsz6Rgf0lfR0WWb0w_visual-150719f6d2d",
    description: "lorem ipsum dolor set amit",
    tags: ["tech"],
    wanted: true
}, {
    title: "Techcrunch",
    websiteUrl: "http://techcrunch.com",
    streamId: "feed/http://feeds.feedburner.com/Techcrunch",
    icon: "http://storage.googleapis.com/site-assets/Xne8uW_IUiZhV1EuO2ZMzIrc2Ak6NlhGjboZ-Yk0rJ8_visual-14e42a4d997",
    description: "lorem ipsum dolor set amit",
    tags: ["tech"],
    wanted: true
}, {
    title: "Gizmodo",
    websiteUrl: "http://gizmodo.com",
    streamId: "feed/http://feeds.gawker.com/gizmodo/full",
    icon: "http://storage.googleapis.com/site-assets/YgTD2rF1XSAfR77lKtxrTwuR-azzbzQhUxfiRyg1u0w_visual-14cde04613e",
    description: "lorem ipsum dolor set amit",
    tags: ["tech"],
    wanted: true
}, {
    title: "Dribbble",
    websiteUrl: "https://dribbble.com/",
    streamId: "feed/http://dribbble.com/shots/popular.rss",
    icon: "http://storage.googleapis.com/site-assets/BnJ8HLdN6KkB0LbmwfVmx3aWGMAdrc5NScyF4JLTJnM_visual-14a5c737fe2",
    description: "lorem ipsum dolor set amit",
    tags: ["art"],
    wanted: true
}]);

/* Update feed with a new feed list */
function makeFeed(newFeedList) {
    feedList = newFeedList;
    ss.storage.feedList = feedList;
    Log("Updated feed. feedList.length: " + ss.storage.feedList.length);
}

function updateFeed() {
    ss.storage.feedList = feedList;
    Log("Updated feed. feedList.length: " + ss.storage.feedList.length);
}



/* fetch bookmarks */
function getBookmarks() {
    const { search } = require("sdk/places/bookmarks");
    Log("Getting bookmarks");
    // TODO: Bookmarks caching
    search({
        query: ""
    }).on("end", function(bookmarks) {
        Log("Processing bookmarks");
        // FIXME: Nested groups will be flattened this way.
        var BMGroups = {};
        for (let i = 0; i < bookmarks.length; i++) {
            var bm = bookmarks[i];
            var bookmark = {};
            bookmark.title = bm.title;
            bookmark.url = bm.url;

            if (BMGroups[bm.group.id]) {
                BMGroups[bm.group.id].children.push(bookmark);
            } else {
                BMGroups[bm.group.id] = {
                    title: bm.group.title,
                    children: [bookmark]
                };
            }
        }

        for (var key in BMGroups) {
            if (BMGroups.hasOwnProperty(key)) {
                bookmarksTree.push(BMGroups[key]);
            }
        }
    });
}


function getHistory() {
    var history = [];
    pageMod.PageMod({
        include: "resource://blink/data/*",
        contentScriptFile: data.url("js/historyManager.js"),
        contentScriptWhen: 'ready',
        onAttach: function(worker) {
            worker.port.on("getHistory", function(nothing) {
                worker.port.emit("history", history);
                Log("Emmitting history");
            });
        }
    });
    const { search } = require("sdk/places/history");
    // Simple query
    Log("Getting history");
    search(
      { url: "" },
      { count: 1000,
        sort: "visitCount",
        descending: true
      }
    ).on("end", function (results) {
        Log("Got history");
        history = results;
    });
}

/* Helper function to get index of object */
var indexOf = function(o) {
    for (var i = 0; i < feedList.length; i++) {
        if (feedList[i].title == o.title &&
                feedList[i].websiteUrl == o.websiteUrl) {
            return i;
        }
    }
    return -1;
};

/* util for debugging */
function Log(log) {
    if (devlogs) console.log(log);
}
