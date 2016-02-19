(function() {

    var app = angular.module('blink');
    var TAG = "BLINK: ";

    var FeedController = function($scope, $document, $timeout, $http) {
        $scope.entryList = [];
        $scope.feedMap = {};
        $scope.showTopButton = false;
        $scope.showProgressbar = true;
        $scope.emptyFeedList = false;
        $scope.timedOut = false;
        $scope.pendingRequest = false;
        $scope.feedRatio = 'b';
        var feedSourceList = [];
        var streamUrlPrefix = "https://cloud.feedly.com/v3/streams/contents?streamId=";
        // Mix in some trending news
        var trendingUrlPrefix = "https://cloud.feedly.com/v3/mixes/contents?streamId=";
        var count15 = "&count=15";
        var count7 = "&count=7";
        var count8 = "&count=8";
        var fbPrefix = "https://www.facebook.com/sharer/sharer.php?u=";
        var twitterPrefix = "https://twitter.com/intent/tweet?status=";
        var googleplusPrefix = "https://plus.google.com/share?url=";
        var minEntryThreshold;
        var shuffleFeed = true;

        // Get feed ratio
        chrome.storage.sync.get("userSettings", function(settings) {
            // Fail silently for now
            if (chrome.runtime.lastError)
                return;

            if (settings.userSettings == "undefined" ||
                typeof settings.userSettings === "undefined")
                return;

            $scope.feedRatio = settings.userSettings.feedType;
            shuffleFeed = settings.userSettings.shuffleFeed;
        });

        // Get feed list
        chrome.storage.sync.get("feedList", function(feedList) {
            if (chrome.runtime.lastError || feedList.feedList == "undefined" ||
                typeof feedList.feedList === "undefined" ||
                feedList.feedList.length === 0) {
                $scope.showProgressbar = false;
                $scope.emptyFeedList = true;
                $scope.timedOut = false;
                $scope.pendingRequest = false;
            }

            feedSourceList = feedList.feedList;
            minEntryThreshold = feedSourceList.length * 13;
            // Fetch feed items
            fetchAllFeed();
        });


        function fetchAllFeed() {
            $timeout(function() {
                // We still havent got any response after 10 secs, inform user
                if ($scope.pendingRequest) {
                    $scope.showProgressbar = false;
                    $scope.timedOut = true;
                    $scope.emptyFeedList = true;
                    $scope.pendingRequest = false;
                }
            }, 10 * 1000);
            feedSourceList.forEach(function(feedSource, index, _) {
                if (feedSource.wanted) {
                    // Make requests at random intervals to minimize 429s
                    $timeout(function() {
                        switch ($scope.feedRatio) {
                            case 'l':
                                makeHttpRequest(
                                    streamUrlPrefix + feedSource.streamId + count15,
                                    entryMaker, feedSource);
                                break;
                            case 'b':
                                makeHttpRequest(
                                    streamUrlPrefix + feedSource.streamId + count8,
                                    entryMaker, feedSource);
                                makeHttpRequest(
                                    trendingUrlPrefix + feedSource.streamId + count7,
                                    entryMaker, feedSource);
                                break;
                            case 't':
                                makeHttpRequest(
                                    trendingUrlPrefix + feedSource.streamId + count15,
                                    entryMaker, feedSource);
                                break;
                        }
                    }, Math.random() * 25 + 100);
                } else minEntryThreshold -= 13;
            });
        };

        function entryMaker(responseData, feedSource) {
            addEntries(parseFeed(responseData, feedSource));
        };

        var makeHttpRequest = function(url, callback, source) {
            $http({
                url: url,
                method: 'GET',
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET',
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            }).then(function(response) {
                callback(response.data, source)
            });
        };

        var parseFeed = function(feedJson, feedItem) {
            var feedObject = angular.fromJson(feedJson);
            var urlRegex = new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?");
            var entryUrl = function(link, alt) {
                if (urlRegex.test(link))
                    return link;
                else return alt;
            };

            var entries = []

            for (i = 0; i < feedObject.items.length; i++) {
                var contentSnippet = getContentSnippet(feedObject.items[i].summary,
                    feedObject.items[i].content);
                if (usefulEntry(feedObject.items[i].title, contentSnippet)) {
                    entries.push({
                        entryTitle: feedObject.items[i].title,
                        entryUrl: entryUrl(feedObject.items[i].originId,
                            feedObject.items[i].alternate[0].href),
                        timestamp: feedObject.items[i].published,
                        coverUrl: getVisualUrl(feedObject.items[i].visual, feedItem.icon),
                        contentSnippet: contentSnippet,
                        flames: getFlames(feedObject.items[i].engagementRate),
                        feedSourceTitle: feedObject.title,
                        feedSourceSiteUrl: feedItem.websiteUrl
                    });
                }
            }

            return entries;
        };

        /* Make the content summary readable */
        var getContentSnippet = function(summary, content) {
            // Some feed entries don't have a summary available, some don't have
            // content. So pick whatever is available.
            var snippet = "";
            if (typeof summary === 'undefined')
                if (typeof content === 'undefined')
                    return snippet;
                else snippet = content.content;
            else snippet = summary.content;
            // Remove HTML tags
            snippet = snippet.replace(/(<([^>]+)>)/ig, "");
            // Remove \r and \n occurences
            snippet = snippet.replace(/\r?\n/g, "");
            // Replace &quot; with ""
            snippet = snippet.replace(/&quot;/g, '"');
            // Replace all occurences of 'Read More'
            var regex = new RegExp("Read More", 'g');
            snippet = snippet.replace(regex, '');
            // Adding ellipsis
            if (snippet.length > 150) {
                snippet = snippet.substring(0, 150);
                snippet = snippet.substring(0, snippet.lastIndexOf(" ") + 1);
            }
            if (snippet.length === 0)
                snippet = "";
            else snippet += "...";
            return snippet;
        };

        var getFlames = function(er) {
            if (!er || er < 3.5) return 0;
            else if (er > 3.5 && er < 8) return 1;
            else return 2;
        };

        var usefulEntry = function(title, snippet) {
            if (title.length === 0 && snippet.length === 0)
                return false;
            else return true;
        };

        var getVisualUrl = function(img, icon) {
            if (typeof img === 'undefined' || img === 'none')
                return icon;
            else if (typeof img.url === 'undefined' || img.url === 'none')
                return icon;
            else return img.url;
        };

        var addEntries = function(entries) {
            $scope.entryList.push.apply($scope.entryList, entries);
            if (shuffleFeed)
                $scope.entryList = shuffle($scope.entryList);
            $scope.timedOut = false;
            $scope.emptyFeedList = false;
            $scope.pendingRequest = false;
            if ($scope.entryList.length >= minEntryThreshold) {
                $scope.showProgressbar = false;
            }
        };

        $scope.toTheTop = function() {
            $document.scrollTopAnimated(0, 1750);
        };

        // Open popup window. Code adopted from:
        // http://www.nigraphic.com/blog/java-script/how-open-new-window-popup-center-screen
        $scope.popup = function popupCenter(sharePoint, suffix) {
            var url, title;
            switch (sharePoint) {
                case 'f':
                    url = fbPrefix;
                    title = "Share on Facebook";
                    break;
                case 't':
                    url = twitterPrefix;
                    title = "Share on Twitter";
                    break;
                case 'g':
                    url = googleplusPrefix;
                    title = "Share on Google+";
                    break;
            }
            url = url + suffix;
            // console.log("Opening popup for: " + url);
            var h = 500,
                w = 500;
            var left = (screen.width / 2) - (w / 2);
            var top = (screen.height / 2) - (h / 2);
            return window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
        };

        /* Fischer-Yates aka Knuth shuffle */
        var shuffle = function(array) {
            var currentIndex = array.length,
                temporaryValue, randomIndex;

            // While there remain elements to shuffle...
            while (0 !== currentIndex) {

                // Pick a remaining element...
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;

                // And swap it with the current element.
                temporaryValue = array[currentIndex];
                array[currentIndex] = array[randomIndex];
                array[randomIndex] = temporaryValue;
            }

            return array;
        };

        $scope.columns = function() {
            var w = window.innerWidth;
            if (w > 1000) return 3;
            else if (w < 1000 && w > 420) return 2;
            else return 1;
        };

        $scope.getPublishedTime = function(time) {
            var diff = new Date().getTime() - time;
            var t = diff / (60 * 60 * 1000); // Calculate hours
            if (t >= 1 && t < 24)
                return Math.floor(t).toString() +
                    (Math.floor(t).toString() == 1 ? " hr ago" : " hrs ago");
            else if (t < 1)
                return Math.floor(t * 60).toString() +
                    (Math.floor(t * 60).toString() == 1 ? " min ago" : " mins ago");
            else return Math.floor(t / 24).toString() +
                (Math.floor(t / 24).toString() == 1 ? " day ago" : " days ago");
        };

    };

    app.controller('FeedController', ['$scope', '$document', '$timeout',
                                        '$http', FeedController]);

}());
