(function() {

    var app = angular.module('blink');
    var TAG = "BLINK: ";

    var FeedController = function($scope) {

        $scope.entryList = [];

        $scope.$root.$on('$messageIncoming', function(event, data) {
            data = angular.fromJson(data);
            if(data.target == "FeedController") {
                console.log(TAG + "message for FC");
                switch (data.intent) {
                    case "feedEntries":
                        $scope.entryList.push.apply($scope.entryList, data.payload.entries);
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
        };
        $scope.fetchAllFeed();

        // TODO: call fetchAllFeed on refresh

    };

    app.controller('FeedController', ['$scope', FeedController]);

}());
