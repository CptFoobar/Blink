(function() {

    var app = angular.module('blink');

    var HomeController = function($scope, $interval, $location) {

        var greetingFor = function(hours) {
            if (hours > 3 && hours < 12) return "Morning";
            else if (hours >= 12 && hours < 16) return "Afternoon";
            else return "Evening";
        };

        $scope.clock = Date.now();
        $scope.greeting = greetingFor(new Date().getHours());
        $scope.username = "";
        $scope.showGreeting = false;

        chrome.storage.sync.get("userSettings", function(settings) {
            // It's safe to fail silently if there is error retrieving settings
            if (chrome.runtime.lastError)
                return;

            if (settings.userSettings == "undefined" ||
              typeof settings.userSettings === "undefined")
                return;

            if (settings.userSettings.justFeed) {
                $location.path("/feed");
            } else {
                $scope.username = settings.userSettings.userName;
                $scope.showGreeting = settings.userSettings.showGreeting;
            }
        });

        $scope.clocky = function() {
            $interval(function() {
                $scope.clock = Date.now();
                $scope.greeting = greetingFor(new Date().getHours());
            }, 1000)
        };

        $scope.clocky();

    };

    app.controller('HomeController', ['$scope', '$interval', '$location', HomeController]);

}());
