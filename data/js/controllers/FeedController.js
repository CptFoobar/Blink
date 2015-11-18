(function() {

    var app = angular.module('blink');
    var TAG = "BLINK: ";

    var FeedController = function($scope, $document) {
        // TODO: Move entrylist and feedmap into a service
        $scope.entryList = [];
        $scope.feedMap = {};
        $scope.showTopButton = false;
        var addEntries = function(entries) {
            $scope.entryList.push.apply($scope.entryList, entries);
            $scope.entryList = shuffle($scope.entryList);
        };

        $scope.toTheTop = function() {
            $document.scrollTopAnimated(0, 1750);
        };

        /*  Fischer-Yates aka Knuth shuffle */
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
                        //$scope.entryList.push.apply($scope.entryList, data.payload.entries);
                        break;
                }
            }
        });

        $scope.fetchAllFeed = function() {
            $scope.$emit(
                '$messageOutgoing',
                angular.toJson({
                    target: "FeedHandler",
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
