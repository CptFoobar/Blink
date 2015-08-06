const { Cc, Ci, Cu } = require("chrome");
const windowMediator = Cc["@mozilla.org/appshell/window-mediator;1"]
                     .getService(Ci.nsIWindowMediator);
const self = require('sdk/self');
const services = require("sdk/preferences/service");
const newTabURL = self.data.url("sources/tab.html");
const helpTabUrl = self.data.url("sources/help.html");


const setNewTabURL = function() {
	/* Set new tab source */
	services.set("browser.newtab.url", self.data.url("sources/tab.html"));
	/* TODO: Use better approach given here: 
	https://mike.kaply.com/2012/06/21/best-practices-for-overriding-the-new-tab-page-with-your-extension/
	*/
};

const clearTabUrlbar = function() {
	/* Clear New tab's url bar. */
	let windows = windowMediator.getEnumerator(null);
	while (windows.hasMoreElements()) {
		let window = windows.getNext();
		window.gInitialPages.push(newTabURL);
		window.gInitialPages.push(helpTabUrl);
	}
};

setNewTabURL();
clearTabUrlbar();

