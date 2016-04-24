(function() {

    var app = angular.module('blink', ['duScroll', 'ngAnimate',
        'ngRoute', 'ui.bootstrap']);

    var routingTable = [{
        target: "/feed",
        url: "markup/feed.html",
        controller: "FeedController"
    }, {
        target: "/blink/settings",
        url: "markup/settings.html",
        controller: "SettingsController"
    }, {
        target: "/blink/content",
        url: "markup/content.html",
        controller: "ContentController"
    }, {
        target: "/blink/help",
        url: "markup/help.html"
    }, {
        target: "/blink/about",
        url: "markup/about.html"
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
            redirectTo: "/feed"
        });

    });

    // Code adopted from http://stackoverflow.com/a/14837021
    app.directive('focusMe', function($timeout, $parse) {
        return {
            link: function(scope, element, attrs) {
                var model = $parse(attrs.focusMe);
                scope.$watch(model, function(value) {
                    if (value === true) {
                        $timeout(function() {
                            element[0].focus();
                        });
                    }
                });
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

    app.directive("scroll", function($window) {
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

    // Unique filter for ng-repeat. Code adopted from:
    // https://github.com/angular-ui/angular-ui-OLDREPO/blob/master/modules/filters/unique/unique.js
    app.filter('unique', function() {

        return function(items, filterOn) {

            if (filterOn === false) {
                return items;
            }

            if ((filterOn || angular.isUndefined(filterOn)) && angular.isArray(items)) {
                var hashCheck = {},
                    newItems = [];

                var extractValueToCompare = function(item) {
                    if (angular.isObject(item) && angular.isString(filterOn)) {
                        return item[filterOn];
                    } else {
                        return item;
                    }
                };

                angular.forEach(items, function(item) {
                    var valueToCheck, isDuplicate = false;

                    for (var i = 0; i < newItems.length; i++) {
                        if (angular.equals(extractValueToCompare(newItems[i]), extractValueToCompare(item))) {
                            isDuplicate = true;
                            break;
                        }
                    }
                    if (!isDuplicate) {
                        newItems.push(item);
                    }

                });
                items = newItems;
            }
            return items;
        };
    });

    app.filter('orderObjectBy', function() {
        return function(items, field, reverse) {
            var filtered = [];
            angular.forEach(items, function(item) {
                filtered.push(item);
            });
            filtered.sort(function(a, b) {
                return (a[field] > b[field] ? 1 : -1);
            });
            if (reverse) filtered.reverse();
            return filtered;
        };
    });

}());
