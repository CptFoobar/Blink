const { Cc, Ci, Cu } = require("chrome");
const windowMediator = Cc["@mozilla.org/appshell/window-mediator;1"]
                     .getService(Ci.nsIWindowMediator);
const self = require('sdk/self');
const services = require("sdk/preferences/service");
const newTabURL = self.data.url("sources/tab.html");
const helpTabUrl = self.data.url("sources/help.html");
const { when: unload } = require("sdk/system/unload");
const prefSet = require("sdk/simple-prefs");
var oldNewTab = services.get("browser.newtab.url");
var blinkEnable = prefSet.prefs.blinkEnable;

const blinkInit = function() {
	/* Set new tab source */
	if(blinkEnable) {
		services.set("browser.newtab.url", self.data.url("sources/tab.html"));
		clearTabUrlbar();
	}
	/* TODO: Use better approach given here: 
	https://mike.kaply.com/2012/06/21/best-practices-for-overriding-the-new-tab-page-with-your-extension/
	*/
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
	}
};

const clearSettings = function() {
	console.log("clearing");
	services.set("browser.newtab.url", oldNewTab);
	let windows = windowMediator.getEnumerator(null);
	while (windows.hasMoreElements()) {
		let window = windows.getNext();
		if(window.gInitialPages.indexOf(newTabURL) > -1)
			window.gInitialPages.splice(window.gInitialPages.indexOf(newTabURL), 1);
		if(window.gInitialPages.indexOf(helpTabUrl) > -1)
			window.gInitialPages.splice(window.gInitialPages.indexOf(helpTabUrl), 1);
	}
}


// define a generic prefs change callback
function onPrefChange(prefName) {
    console.log("The " + prefName + 
        " preference changed, current value is: " + 
        prefSet.prefs[prefName]
    );
    if(prefName == "blinkEnable") {
    	console.log("is blinkEnable");
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
	if (reason === "disable") {
		if(blinkEnable)
			clearSettings();
	}
};

blinkInit();

