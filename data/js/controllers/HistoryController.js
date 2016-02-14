(function() {

    var app = angular.module('blink');

    var HistoryController = function($scope) {
        $scope.history = [];
        $scope.showProgressbar = true;
        $scope.noHistory = false;
        var TAG = "HistoryController";

        $scope.$root.$on('$messageIncoming', function(event, data) {
            data = angular.fromJson(data);
            if (data.target == "HistoryController") {
                // console.log(TAG + "message for HC");
                switch (data.intent) {
                    case "history":
                        $scope.history = data.payload.history;
                        $scope.showProgressbar = false;
                        $scope.noHistory = false;
                        break;
                    case "noHistory":
                        $scope.showProgressbar = false;
                        $scope.noHistory = true;
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
            // console.log("called fetchHistory.");
        };

        $scope.fetchHistory();



    }

    app.controller('HistoryController', ['$scope', HistoryController]);

}());
