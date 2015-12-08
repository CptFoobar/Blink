(function() {
    var app = angular.module('blink');

    var MainController = function($scope, $location) {

        $scope.goTo = function(path) {
            console.log("Going to: " + path + " " + typeof path);
            $location.path(path);
        }

    };

    app.controller('MainController', ['$scope', '$location', MainController]);

}());
