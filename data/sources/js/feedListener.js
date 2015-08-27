window.addEventListener('message', function(event) {
	self.port.emit("newFeedList", event.data);
}, false);