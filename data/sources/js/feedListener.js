window.addEventListener('message', function(event) {
	console.log("got it");
	self.port.emit("newFeedList", event.data);
}, false);