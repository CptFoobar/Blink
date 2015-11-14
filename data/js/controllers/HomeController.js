(function() {

    var app = angular.module('blink');

    var HomeController = function($scope, $interval) {

        var greetingFor = function(hours) {
           if(hours > 3 && hours < 12) return "Morning";
           else if(hours >= 12 && hours < 16) return "Afternoon";
           else return "Evening";
       };

       $scope.clock = Date.now();
       $scope.greeting = greetingFor(new Date().getHours());
       $scope.username = "Emma";

       $scope.clocky = function() {
           $interval(function () {
               $scope.clock = Date.now();
               $scope.greeting = greetingFor(new Date().getHours());
           }, 1000)
       };

       $scope.clocky();

    };

    app.controller('HomeController', ['$scope', '$interval', HomeController]);

}());
