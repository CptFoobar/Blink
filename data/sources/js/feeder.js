var i;
for(i = 0; i < self.options.feeds.length; i++) {
	window.postMessage(self.options.feeds[i], "resource://blink/data/sources/tab.html");
}
