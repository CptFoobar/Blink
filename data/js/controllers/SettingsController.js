(function(){

    var app = angular.module('blink');

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

            chrome.storage.sync.set({ "userSettings": userSettings },
              function() {
                console.log("Saved settings");
                if (chrome.runtime.lastError)
                    $scope.$apply(function(){
                        $scope.alerts.push({type: "danger", msg: "Failed to save " +
                            "settings. Please reload the page and try again."})
                    });
                else
                    $scope.$apply(function(){
                        $scope.alerts.push({type: "success", msg: "Settings saved"})
                    });
            });
        }

        chrome.storage.sync.get("userSettings", function(settings) {
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
