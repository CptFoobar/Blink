(function(){

    var app = angular.module('blink');
    const storage = require('electron-json-storage');

    var SettingsController = function($scope) {

        $scope.showProgressbar = true;
        $scope.showGreeting = true;
        $scope.userName = "User";
        $scope.feedType = 'b';
        $scope.shuffleFeed = true;
        $scope.alerts = [];

        $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
        }

        $scope.saveConfig = function() {
            var userSettings = {
                showGreeting: $scope.showGreeting,
                userName: $scope.userName,
                feedType: $scope.feedType,
                shuffleFeed: $scope.shuffleFeed
            };
            storage.get("blinkSettings", function(error, settings) {
                // Fail silently for now
                if (error)
                    return;

                if (settings.userSettings == "undefined" ||
                    typeof settings.userSettings === "undefined")
                    return;

                storage.set("blinkSettings", {
                    "userSettings": JSON.stringify(userSettings),
                    "feedList": JSON.stringify(settings.feedList)
                }, function() {
                    if (!error) {
                        $scope.$apply(function(){
                            $scope.alerts.push({type: "success", msg: "Settings saved"})
                        });
                    } else {
                        $scope.$apply(function(){
                            $scope.alerts.push({type: "danger", msg: "Failed to save " +
                                "settings. Please reload the page and try again."})
                        });
                    }
                });
            });
        }

            storage.get("userSettings", function(settings) {
                $scope.showProgressbar = false;
                if (settings.userSettings == "undefined" ||
                  typeof settings.userSettings === "undefined") {
                    $scope.alerts.push({type: "danger", msg: "Failed to load " +
                        "settings. Please reload the page and try again."});
                    return;
            }

            $scope.showGreeting = settings.userSettings.showGreeting;
            $scope.userName = settings.userSettings.userName;
            $scope.feedType = settings.userSettings.feedType;
            $scope.shuffleFeed = settings.userSettings.shuffleFeed;

        });

    };

    app.controller('SettingsController', ['$scope', SettingsController]);

}());
