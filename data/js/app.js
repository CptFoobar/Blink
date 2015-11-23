(function() {

    var app = angular.module('blink', ['duScroll', 'ngAnimate', 'ngPostMessage',
        'ngRoute', 'ui.bootstrap', 'vAccordion'
    ]);

    var routingTable = [{
        target: "/home",
        url: "markup/home.html",
        controller: "HomeController"
    }, {
        target: "/feed",
        url: "markup/feed.html",
        controller: "FeedController"
    }, {
        target: "/recent",
        url: "markup/history.html",
        controller: "HistoryController"
    }, {
        target: "/bookmarks",
        url: "markup/bookmarks.html",
        controller: "BookmarkController"
    }, {
        target: "/blink/settings",
        url: "markup/settings.html",
        controller: "SettingsController"
    }, {
        target: "/blink/content",
        url: "markup/content.html",
        controller: "ContentController"
    }];

    app.config(function($routeProvider) {

        /* Add routes */
        angular.forEach(routingTable, function(route) {
            $routeProvider.when(route.target, {
                templateUrl: route.url,
                controller: route.controller
            });
        });

        /* Default route */
        $routeProvider.otherwise({
            redirectTo: "/home"
        });

    });

    app.directive('focusMe', function($timeout, $parse) {
        return {
            //scope: true,   // optionally create a child scope
            link: function(scope, element, attrs) {
                var model = $parse(attrs.focusMe);
                scope.$watch(model, function(value) {
                    if (value === true) {
                        $timeout(function() {
                            element[0].focus();
                        });
                    }
                });
                // to address @blesh's comment, set attribute value to 'false'
                // on blur event:
                element.bind('blur', function() {
                    scope.$apply(model.assign(scope, false));
                });
            }
        };
    });

    app.filter('range', function() {
        return function(input, total) {
            total = parseInt(total);
            for (var i = 0; i < total; i++)
                input.push(i);
            return input;
        };
    });

    app.directive("scroll", function ($window) {
    return function(scope, element, attrs) {
        angular.element($window).bind("scroll", function() {
             if (this.pageYOffset >= 50) {
                 scope.showTopButton = true;
             } else {
                 scope.showTopButton = false;
             }
            scope.$apply();
        });
    };
});
}());
