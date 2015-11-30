(function(){

    var app = angular.module('blink');

    var SettingsController = function($scope) {

        $scope.showProgressbar = true;
        $scope.showGreeting = true;
        $scope.userName = "User";
        $scope.feedType = 'b';
        $scope.alerts = [];

        $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
        }

        $scope.saveConfig = function(){
            var cfg = {
                showGreeting: $scope.showGreeting,
                userName: $scope.userName,
                feedType: $scope.feedType
            };

            $scope.$emit(
                '$messageOutgoing',
                angular.toJson({
                    target: "SettingsManager",
                    intent: "saveConfig",
                    payload: {
                        config: cfg
                    }
                })
            );

            $scope.alerts.push({type: "success", msg: "Configuration saved"});
        }

        var config = function(cfg) {
            $scope.showGreeting = cfg.showGreeting;
            $scope.userName = cfg.userName;
            $scope.feedType = cfg.feedType;
        };

        $scope.$root.$on('$messageIncoming', function(event, data) {
            data = angular.fromJson(data);
            if (data.target == "SettingsController") {
                console.log("message for SC");
                switch (data.intent) {
                    case "config":
                        console.log("loading configuration");
                        // Hide progressbar
                        $scope.showProgressbar = false;
                        config(data.payload.config);
                        break;
                }
            }
        });

        $scope.$emit(
            '$messageOutgoing',
            angular.toJson({
                target: "SettingsManager",
                intent: "getConfig",
                payload: {}
            })
        );
    };

    app.controller('SettingsController', ['$scope', SettingsController]);

}());
