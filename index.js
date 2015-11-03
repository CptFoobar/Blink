const self = require('sdk/self');
const data = self.data;
const pageMod = require("sdk/page-mod");
const tabs = require("sdk/tabs")


pageMod.PageMod({
	include: "resource://blink/data/blink_shell.html",
	contentScriptFile: data.url("js/test.js"),
	contentScriptWhen: 'end'
  }
);
