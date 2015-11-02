(function() {

    var app = angular.module('blink', ['ngAnimate', 'ngRoute', 'ngMaterial', 'ui.bootstrap']);
    // TODO: Set theme as per user setting
    var dark = true;

    var routingTable = [
        {
            target: "/home",
            url: "markup/home.html",
            controller: "HomeController"
        },
        {
            target: "/feed",
            url: "markup/feed.html",
            controller: "FeedController"
        },
        {
            target: "/recent",
            url: "markup/recent.html",
            controller: "RecentController"
        },
        {
            target: "/bookmarks",
            url: "markup/bookmarks.html",
            controller: "BookmarkController"
        },
        {
            target: "/blink/settings",
            url: "markup/settings.html",
            controller: "SettingsController"
        },
        {
            target: "/blink/content",
            url: "markup/content.html",
            controller: "ContentController"
        }
    ];

    app.config(function($routeProvider, $mdThemingProvider) {
        /* Set theme */
        $mdThemingProvider.theme('default')
            .primaryPalette('purple')
            .accentPalette('pink')
            .warnPalette('red')
            .backgroundPalette('blue-grey');
        /* Set theme dark if required */
        if (dark)
            $mdThemingProvider.theme('default').dark();

        /* Add routes */
        angular.forEach(routingTable, function(route){
            $routeProvider.when(route.target, {
                templateUrl: route.url,
                controller: route.controller
            });
        });

        /* Default route */
        $routeProvider.otherwise({ redirectTo: "/home"});
    });
}());
