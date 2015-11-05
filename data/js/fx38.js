const {Cc, Ci} = require("chrome");
const windowMediator = Cc["@mozilla.org/appshell/window-mediator;1"]
    .getService(Ci.nsIWindowMediator);
const services = require("sdk/preferences/service");

const clearTabUrlbar = function(newTabURL) {
    let windows = windowMediator.getEnumerator(null);
    while (windows.hasMoreElements()) {
        let window = windows.getNext();
        if (window.gInitialPages.indexOf(newTabURL) == -1)
            window.gInitialPages.push(newTabURL);
    }
};

const clearSettings = function(oldNewTab) {
    services.set("browser.newtab.url", oldNewTab);
    let windows = windowMediator.getEnumerator(null);
    while (windows.hasMoreElements()) {
	  let window = windows.getNext();
	  if(window.gInitialPages.indexOf(newTabURL) > -1)
	    window.gInitialPages.splice(window.gInitialPages.indexOf(newTabURL), 1);
  }
}

const setNewTabUrl = function(newTabUrl) {
    services.set("browser.newtab.url", newTabUrl);
    clearTabUrlbar(newTabUrl);
}


exports.setNewTabUrl = setNewTabUrl;
exports.reset = clearSettings;
