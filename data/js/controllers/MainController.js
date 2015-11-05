(function() {
    var app = angular.module('blink');

    var MainController = function($scope, $location) {
        var self = this;
        self.isOpen = false;
        self.isTbOpen = false;
        self.Menu = {
            label : "Menu",
            icon : "fa-plus"
        };
        self.items = [{
            name: "Content",
            icon: "fa-rss-square",
            direction: "right",
            target : '/content'
        }, {
            name: "Settings",
            icon: "fa-cog",
            direction: "right",
            target : '/content'
        }, {
            name: "Help",
            icon: "fa-question",
            direction: "right",
            target : '/content'
        }, {
            name: "About",
            icon: "fa-info",
            direction: "right",
            target : '/content'
        }];

        $scope.goTo = function(path) {
            console.log("Going to: " + path + " " + typeof path);
            $location.path(path);
        }

        $scope.toggleMenu = function() {
            self.isOpen = !self.Open;
        }
    };



    app.controller('MainController', ['$scope', '$location', MainController]);

}());
