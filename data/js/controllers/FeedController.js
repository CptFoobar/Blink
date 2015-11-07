(function() {

    var app = angular.module('blink');
    var TAG = "BLINK: ";

    var FeedController = function($scope) {

        $scope.entryList = [];
        $scope.feedMap = {};

        $scope.$root.$on('$messageIncoming', function(event, data) {
            data = angular.fromJson(data);
            if(data.target == "FeedController") {
                console.log(TAG + "message for FC");
                switch (data.intent) {
                    case "feedEntries":
                        console.log("adding entries");
                        $scope.feedMap[data.payload.hashCode] = {
                            title : data.payload.title,
                            siteUrl : data.payload.siteUrl,
                            iconUrl : data.payload.iconUrl
                        };
                        $scope.entryList.push.apply($scope.entryList, data.payload.entries);
                        break;
                }
            }
        });

        $scope.fetchAllFeed = function() {
            $scope.$emit(
                '$messageOutgoing',
                angular.toJson({
                    target : "FeedHandler",
                    intent : "fetch",
                    payload : {}
                })
            );
            console.log("called fetchAllFeed.");
        };

        $scope.fetchAllFeed();
    };

    app.controller('FeedController', ['$scope', FeedController]);

}());
