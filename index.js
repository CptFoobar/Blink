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
var version = require("sdk/system").version;
var devlogs = true; // set true to enable logging

var newTabURL = data.url("blink_shell.html");
// TODO: Add other urls to be hidden into a list

const useNewAPI = version >= "41.0";

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
    if (reason === "disable" || reason === "uninstall") {
        clearSettings();
    }
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

    if (devlogs) console.log("oldNewTab: " + ont);

    return ont;
};

/* Init function. Da bomb. */
function blinkInit() {
    if (blinkEnable) {
        if (useNewAPI) {
            if (devlogs) console.log("Using new API")
            NewTabURL.override(newTabURL);
        } else {
            if (devlogs) console.log("Using old API")
            fx38.setNewTabUrl(newTabURL);
        }

        // Set PageMod
        pageMod.PageMod({
            include: "resource://blink/data/blink_shell.html",
            contentScriptFile: data.url("js/feedHandler.js"),
            contentScriptWhen: 'end'
        });
    }
};

/* Clear the settings we changed */
function clearSettings() {
    if (useNewAPI) {
        if (devlogs) console.log("Clearing from " + version);
        NewTabURL.override(oldNewTab);
    } else {
        if (devlogs) console.log("Clearing from " + version + " the old way");
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
