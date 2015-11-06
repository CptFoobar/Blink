(function() {

    var app = angular.module('blink');
    var TAG = "BLINK: ";
    var FeedController = function($scope) {
        $scope.$root.$on('$messageIncoming', function(event, data) {
            data = angular.fromJson(data);
            if(data.target == "FeedController") {
                console.log(TAG + "message for FC");
                switch (data.intent) {
                    case "feedEntries":
                        // TODO: Handle feedEntries
                        alert(data.payload.entries.length);
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
    };

    app.controller('FeedController', ['$scope', FeedController]);

}());
