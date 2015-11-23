(function() {

    var app = angular.module('blink');

    var HistoryController = function($scope) {
        $scope.history = [];
        var TAG = "HistoryController";

        $scope.$root.$on('$messageIncoming', function(event, data) {
            data = angular.fromJson(data);
            if (data.target == "HistoryController") {
                console.log(TAG + "message for HC");
                switch (data.intent) {
                    case "history":
                        console.log("Got history");
                        $scope.history = data.payload;
                        break;
                }
            }
        });

        $scope.fetchHistory = function() {
            $scope.$emit(
                '$messageOutgoing',
                angular.toJson({
                    target: "HistoryManager",
                    intent: "fetch",
                    payload: {}
                })
            );
            console.log("called fetchHistory.");
        };

        $scope.fetchHistory();



    }

    app.controller('HistoryController', ['$scope', HistoryController]);

}());
