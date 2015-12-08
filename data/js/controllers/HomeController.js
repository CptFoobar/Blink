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
       $scope.username = "";
       $scope.showGreeting = false;

       $scope.clocky = function() {
           $interval(function () {
               $scope.clock = Date.now();
               $scope.greeting = greetingFor(new Date().getHours());
           }, 1000)
       };

       $scope.clocky();

       $scope.$emit(
           '$messageOutgoing',
           angular.toJson({
               target: "HomeManager",
               intent: "getHomeConfig",
               payload: {}
           })
       );

       $scope.$root.$on('$messageIncoming', function(event, data) {
           data = angular.fromJson(data);
           if (data.target == "HomeController") {
               console.log("message for HC");
               switch (data.intent) {
                   case "homeConfig":
                       $scope.username = data.payload.config.userName;
                       $scope.showGreeting = data.payload.config.showGreeting;
                       break;
               }
           }
       });
       console.log("called fetchAllBookmarks.");
    };

    app.controller('HomeController', ['$scope', '$interval', HomeController]);

}());
