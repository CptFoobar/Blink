var url = "https://cloud.feedly.com/v3/mixes/contents?streamId=feed/http://feeds.feedburner.com/Techcrunch";

var request = new XMLHttpRequest();
request.open("GET", url, true);
request.onload = function() {
    var jsonResponse = JSON.parse(request.responseText);
    console.log("Response: " + JSON.stringify(jsonResponse));
};
request.send();
