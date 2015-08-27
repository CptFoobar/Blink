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
const browserWindows = require("sdk/windows").browserWindows;
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

var feedPrefs = [{
					"name" : "TechCrunch", 
					"link" : "http://feeds.feedburner.com/Techcrunch",
					"wanted" : true
				 },
				 {
					"name" : "Gizmodo", 
					"link" : "http://feeds.gawker.com/gizmodo/full",
					"wanted" : true
				 },
				 {
					"name" : "Engadget", 
					"link" : "http://www.engadget.com/rss.xml",
					"wanted" : true
				 },
				 {
					"name" : "LifeHacker", 
					"link" : "http://feeds.gawker.com/lifehacker/vip",
					"wanted" : true
				 },
				 {
					"name" : "The Verge", 
					"link" : "http://www.theverge.com/rss/index.xml",
					"wanted" : true
				 },
				 {
					"name" : "Mashable", 
					"link" : "http://feeds.mashable.com/mashable/tech",
					"wanted" : true
				 },
				 {
					"name" : "Wired", 
					"link" : "http://feeds.wired.com/wired/index",
					"wanted" : true
				 },
				 {
					"name" : "The Next Web", 
					"link" : "http://thenextweb.com/feed/",
					"wanted" : true
				 }];

var getFeeds = function() {
	var f = [];
	for(var i = 0; i < feedPrefs.length; i++) {
		if(feedPrefs[i].wanted)
			f.push(feedPrefs[i].link)
	}
	return f;
}

var feeds = getFeeds();

var refreshFeeds = function(feedList) {
	feedPrefs = feedList;
	feeds = getFeeds();
}

pageMod.PageMod({
	include: "resource://blink/data/sources/tab.html",
	contentScriptFile: self.data.url("resource://blink/data/sources/js/feeder.js"),
//	contentScriptOptions: {"feeds": feeds},
	contentScriptWhen: 'end',
	onAttach: function(worker) {
    	worker.port.emit("feedList", feeds);
    }
});

pageMod.PageMod({
	include: "resource://blink/data/sources/content.html",
	contentScriptFile: self.data.url("sources/js/feedListener.js"),
	contentScript: 'window.postMessage(self.options.feedPrefs, "resource://blink/data/sources/content.html");',
	contentScriptOptions: {"feedPrefs": feedPrefs},
	contentScriptWhen: 'end',
	onAttach: function(worker) {
    	worker.port.on("newFeedList", function(newFeeds) {
      	refreshFeeds(newFeeds)
    });
  }
});

// define a generic prefs change callback
function onPrefChange(prefName) {
    if(prefName == "blinkEnable") {
    	blinkEnable = prefSet.prefs.blinkEnable;
    	if(blinkEnable)
    		blinkInit();
    	else
    		clearSettings();
    }
}
 
prefSet.on("blinkEnable", onPrefChange);

unload(function() {
	if(blinkEnable)
		clearSettings();
});

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