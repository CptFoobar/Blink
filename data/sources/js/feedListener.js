self.port.on("feedPrefs", function(feedPrefs){
		window.postMessage(feedPrefs, "resource://blink/data/sources/content.html");
});

window.addEventListener('message', function(event) {
	self.port.emit("newFeedList", event.data);
}, false);