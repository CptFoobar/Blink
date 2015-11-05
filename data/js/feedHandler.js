var feedHandler = (function() {
    var url = "https://cloud.feedly.com/v3/mixes/contents?streamId=feed/http://feeds.feedburner.com/Techcrunch";

    var fetch = function() {
        console.log("fetching...");
        var request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.onload = function() {
            var jsonResponse = JSON.parse(request.responseText);
            //console.log("Response: " + JSON.stringify(jsonResponse));
            var res = {
                target : "FeedController",
                feed : jsonResponse
            };
            window.postMessage(res, "resource://blink");
        };
        request.send();
    }
    return {
        fetch: fetch
    };
}());

window.addEventListener('message', function(event) {
	console.log("Origin: " + event.origin + " Data: " + event.data);
    if(JSON.parse(event.data).target == "FeedHandler")
        feedHandler.fetch();
    else console.log("Not fetching: " + JSON.parse(event.data).target);
}, false);
