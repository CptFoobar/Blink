(function() {

    var app = angular.module('blink');
    var FeedController = function($scope) {
        console.log("Blink: Messaging");
        $scope.$root.$on('$messageIncoming', function(event, data) {
            data = angular.fromJson(data);
            if(data.target == "FeedController"){
                // Handle Feed
            }
        });
        $scope.sendMessage = function() {
            $scope.$emit(
                '$messageOutgoing',
                angular.toJson({
                    "target" : "FeedHandler"
                })
            );
        };
        $scope.sendMessage();
    };

    app.controller('FeedController', ['$scope', FeedController]);

}());
