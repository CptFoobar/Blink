const { Cc, Ci, Cu } = require("chrome");
const NEW_TAB_HOME_URL = "resource://blink/data/blink_shell.html#/home";
const NEW_TAB_URL_BASE = "resource://blink/data/blink_shell.html#/";
const NEW_TAB_URL_EXTS = [
    "blink/about",
    "blink/content",
    "blink/help",
    "blink/settings",
    "bookmarks",
    "feed",
    "home",
    "recent"];
const NEW_TAB_URL_REGEX = "(resource://blink/data/blink_shell.html)(\#/\w*)?";
const Fx41 = "41.0";
const Fx44 = "44.0";
const { getMostRecentBrowserWindow } = require("sdk/window/utils");
const windowMediator = Cc["@mozilla.org/appshell/window-mediator;1"]
                            .getService(Ci.nsIWindowMediator);

var browserWindow = getMostRecentBrowserWindow();

const setNewTab_Fx41 = function() {
    services.set("browser.newtab.url", NEW_TAB_HOME_URL);
}

const setNewTab_Fx44 = function() {
    let NewTabURL = require('resource:///modules/NewTabURL.jsm').NewTabURL;
    NewTabURL.override(NEW_TAB_HOME_URL);
}

const setNewTab_Fx44s = function() {
    const aboutNewTabService = Cc['@mozilla.org/browser/aboutnewtab-service;1']
        .getService(Ci.nsIAboutNewTabService);
    aboutNewTabService.newTabURL = NEW_TAB_HOME_URL;
}

const clearTabUrlbar = function() {
    let windows = windowMediator.getEnumerator(null);
    while (windows.hasMoreElements()) {
        let window = windows.getNext();
        for (let i = 0; i < NEW_TAB_URL_EXTS.length; i++) {
            let urlToHide = NEW_TAB_URL_BASE + NEW_TAB_URL_EXTS[i];
            if (window.gInitialPages.indexOf(urlToHide) == -1)
                window.gInitialPages.push(urlToHide);
        }
    }
}

const clearSettings_Fx41 = function(oldNewTab) {
    services.set("browser.newtab.url", oldNewTab);
}

const clearSettings_Fx44 = function() {
    let NewTabURL = require('resource:///modules/NewTabURL.jsm').NewTabURL;
    NewTabURL.reset();
}

const clearSettings_Fx44s = function() {
    const aboutNewTabService = Cc['@mozilla.org/browser/aboutnewtab-service;1']
        .getService(Ci.nsIAboutNewTabService);
    aboutNewTabService.resetNewTabURL();
}

const resetHiddenPages = function() {
    let windows = windowMediator.getEnumerator(null);
    while (windows.hasMoreElements()) {
        let window = windows.getNext();
        for (let i = 0; i < NEW_TAB_URL_EXTS.length; i++) {
            let hiddenUrl = NEW_TAB_URL_BASE + NEW_TAB_URL_EXTS[i];
            var index = window.gInitialPages.indexOf(hiddenUrl);
            if (index > -1)
                window.gInitialPages.splice(index, 1);
        }
    }
}

const setNewTabUrl = function(version) {
    console.log("Setting new tab")
    if (version <= Fx41)
        setNewTab_Fx41();
    else if (version >= Fx41 && version <= Fx44)
        setNewTab_Fx44();
    else setNewTab_Fx44s();
    clearTabUrlbar();
}

const reset = function(version, oldNewTab) {
    if (version < Fx41)
        clearSettings_Fx41(oldNewTab);
    else if (version >= Fx41 && version < Fx44)
        clearSettings_Fx44();
    else clearSettings_Fx44s();
    resetHiddenPages();
}

exports.setNewTabUrl = setNewTabUrl;
exports.reset = reset;
