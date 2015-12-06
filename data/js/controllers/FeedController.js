(function() {

    var app = angular.module('blink');
    var TAG = "BLINK: ";

    var FeedController = function($scope, $document) {
        // TODO: Add timeout for feed and display 'Aw snap'
        $scope.entryList = [];
        $scope.feedMap = {};
        $scope.showTopButton = false;
        $scope.showProgressbar = true;
        var fbPrefix = "https://www.facebook.com/sharer/sharer.php?u=";
        var twitterPrefix = "https://twitter.com/intent/tweet?status=";
        var googleplusPrefix = "https://plus.google.com/share?url=";

        var addEntries = function(entries) {
            $scope.entryList.push.apply($scope.entryList, entries);
            $scope.entryList = shuffle($scope.entryList);
            if($scope.showProgressbar)
                $scope.showProgressbar = false;
        };

        $scope.toTheTop = function() {
            $document.scrollTopAnimated(0, 1750);
        };

        // Open popup window. Code adopted from:
        // http://www.nigraphic.com/blog/java-script/how-open-new-window-popup-center-screen
        $scope.popup = function popupCenter(sharePoint, suffix) {
            console.log("Opening popup ");
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
            console.log("Opening popup for: " + url);
            var h = 500, w = 500;
            var left = (screen.width / 2) - (w / 2);
            var top = (screen.height / 2) - (h / 2);
            return window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
        }

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

        $scope.$root.$on('$messageIncoming', function(event, data) {
            data = angular.fromJson(data);
            if (data.target == "FeedController") {
                console.log(TAG + "message for FC");
                switch (data.intent) {
                    case "feedEntries":
                        console.log("adding entries");
                        $scope.feedMap[data.payload.hashCode] = {
                            title: data.payload.title,
                            siteUrl: data.payload.siteUrl,
                            iconUrl: data.payload.iconUrl
                        };
                        addEntries(data.payload.entries);
                        break;
                }
            }
        });

        $scope.fetchAllFeed = function() {
            $scope.$emit(
                '$messageOutgoing',
                angular.toJson({
                    target: "FeedManager",
                    intent: "fetch",
                    payload: {}
                })
            );
            console.log("called fetchAllFeed.");
        };

        $scope.fetchAllFeed();
    };

    app.controller('FeedController', ['$scope', '$document', FeedController]);

}());
