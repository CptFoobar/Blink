const { Cc, Ci} = require("chrome");
const windowMediator = Cc["@mozilla.org/appshell/window-mediator;1"]
                     .getService(Ci.nsIWindowMediator);
const self = require('sdk/self');
const services = require("sdk/preferences/service");
const newTabURL = self.data.url("sources/tab.html");
const helpTabUrl = self.data.url("sources/help.html");
const contentTabUrl = self.data.url("sources/content.html");
const { when: unload } = require("sdk/system/unload");
const prefSet = require("sdk/simple-prefs");
const pageMod = require("sdk/page-mod");
const ss = require("sdk/simple-storage");
const browserWindows = require("sdk/windows").browserWindows;
const tabs = require("sdk/tabs")
const defaultPrefs = require(self.data.url("sources/js/defaultConfig.js"));
var oldNewTab = services.get("browser.newtab.url");
var blinkEnable = prefSet.prefs.blinkEnable;

const blinkInit = function() {
	/* Set new tab source */
	if(blinkEnable) {
		services.set("browser.newtab.url", self.data.url("sources/tab.html"));
		clearTabUrlbar();
	}
};

const clearTabUrlbar = function() {
	/* Clear New tab's url bar. */
	let windows = windowMediator.getEnumerator(null);
	while (windows.hasMoreElements()) {
		let window = windows.getNext();
		if(window.gInitialPages.indexOf(newTabURL) == -1)
			window.gInitialPages.push(newTabURL);
		if(window.gInitialPages.indexOf(helpTabUrl) == -1)
			window.gInitialPages.push(helpTabUrl);
		if(window.gInitialPages.indexOf(contentTabUrl) == -1)
			window.gInitialPages.push(contentTabUrl);
	}
};

const clearSettings = function() {
	/* Clear the settings we changed */
	services.set("browser.newtab.url", oldNewTab);
	let windows = windowMediator.getEnumerator(null);
	while (windows.hasMoreElements()) {
		let window = windows.getNext();
		if(window.gInitialPages.indexOf(newTabURL) > -1)
			window.gInitialPages.splice(window.gInitialPages.indexOf(newTabURL), 1);
		if(window.gInitialPages.indexOf(helpTabUrl) > -1)
			window.gInitialPages.splice(window.gInitialPages.indexOf(helpTabUrl), 1);
		if(window.gInitialPages.indexOf(contentTabUrl) > -1)
			window.gInitialPages.splice(window.gInitialPages.indexOf(contentTabUrl), 1);
	}
	browserWindows.removeListener("open", blinkInit);
}

// Feed sources with prefs
var feedPrefs;

if(self.loadReason == "install" || !ss.storage.feedprefs) {
	feedPrefs = defaultPrefs.getDefaultPrefs();
	ss.storage.feedprefs = feedPrefs;
} else {
	feedPrefs = ss.storage.feedprefs;
}

var getFeeds = function() {
	/* Refresh feeds */
	var f = [];
	for(var i = 0; i < feedPrefs.length; i++) {
		if(feedPrefs[i].wanted)
			f.push(feedPrefs[i].link)
	}
	return f;
}

 //feeds only
var feeds = getFeeds();

var refreshFeeds = function(feedList) {
	/* Refresh feed prefs */
	feedPrefs = feedList;
	feeds = getFeeds();
	ss.storage.feedprefs = feedList;
}

pageMod.PageMod({
	include: "resource://blink/data/sources/tab.html",
	contentScriptFile: self.data.url("resource://blink/data/sources/js/feeder.js"),
	contentScriptWhen: 'ready',
	onAttach: function(worker) {
    	worker.port.emit("feedList", feeds);
    }
});

pageMod.PageMod({
	include: "resource://blink/data/sources/content.html",
	contentScriptFile: self.data.url("sources/js/feedListener.js"),
	contentScriptWhen: 'ready',
	onAttach: function(worker) {
		worker.port.emit("feedPrefs", feedPrefs);
    	worker.port.on("newFeedList", function(newFeeds) {
      	refreshFeeds(newFeeds)
    });
  }
});

function onPrefChange(prefName) {
	/* A generic prefs change callback */
    if(prefName == "blinkEnable") {
    	blinkEnable = prefSet.prefs.blinkEnable;
    	if(blinkEnable)
    		blinkInit();
    	else
    		clearSettings();
    }
}
 
prefSet.on("blinkEnable", onPrefChange);

// Clear settings on Unload. (Redundant?)
unload(function() {
	if(blinkEnable)
		clearSettings();
});

/* Clear settings on disable/uninstall. 
 But due to bug https://bugzilla.mozilla.org/show_bug.cgi?id=627432#c12, uninstall is never called */
exports.onUnload = function (reason) {
	if (reason === "disable" || reason === "uninstall") {
		if(blinkEnable)
			clearSettings();
	}
};

// Init Blink
blinkInit();
// Init Blink on new windows when they open
browserWindows.on("open", blinkInit);