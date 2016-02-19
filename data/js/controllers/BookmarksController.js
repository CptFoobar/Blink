(function() {

    var app = angular.module('blink');

    var BookmarkController = function($scope) {

        $scope.bookmarks = [];
        var TAG = "BookmarkController";
        $scope.showProgressbar = true;
        $scope.noBookmarks = false;

        chrome.bookmarks.getTree(function (tree) {
            $scope.showProgressbar = false;
            if (chrome.runtime.lastError) {
                log("Error: " + JSON.stringify(chrome.runtime.lastError));
                return;
            }

            if (tree == "undefined" ||
              typeof tree === "undefined" || tree.length === 0) {
                $scope.noBookmarks = true;
                return
            }

            $scope.bookmarks.splice(0, $scope.bookmarks.length);
            $scope.bookmarks = tree[0].children;

        });
    };

    app.controller("BookmarkController", ['$scope', BookmarkController]);

}());
