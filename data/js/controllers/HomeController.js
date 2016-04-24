(function() {

    var app = angular.module('blink');
    var HomeController = function($location, $timeout) {
        $timeout(function () {
            $location.path("/feed");
        }, 3 * 1000);
    };

    app.controller('HomeController', ['$location', '$timeout', HomeController]);

}());
