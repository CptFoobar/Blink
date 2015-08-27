self.port.on("feedList", function(feedList) {
	for(var i = 0; i < feedList.length; i++) {
		window.postMessage(feedList[i], "resource://blink/data/sources/tab.html");
	}
});