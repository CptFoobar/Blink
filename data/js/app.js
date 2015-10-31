(function(){

    var app = angular.module('blink', ['ngRoute', 'ngMaterial', 'ui.bootstrap']);
    // TODO: Set theme as per user setting
    var dark = true;

    app.config(function($routeProvider, $mdThemingProvider){

        $mdThemingProvider.theme('default')
           .primaryPalette('purple')
           .accentPalette('pink')
           .warnPalette('red')
           .backgroundPalette('blue-grey');

       if(dark)
           $mdThemingProvider.theme('default').dark();

        $routeProvider
            .when("/blink", {
                templateUrl: "home.html",
                controller: "HomeController"
            })
            .otherwise({redirectTo: "/blink"});
    });

}());
