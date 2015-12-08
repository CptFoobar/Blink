(function() {

    var app = angular.module('blink');

    var BookmarkController = function($scope) {

        $scope.bookmarks = [];
        var TAG = "BookmarkController";
        $scope.showProgressbar = true;
        $scope.noBookmarks = false;

        $scope.$root.$on('$messageIncoming', function(event, data) {
            data = angular.fromJson(data);
            if (data.target == "BookmarksController") {
                console.log(TAG + "message for BC");
                switch (data.intent) {
                    case "bookmarks":
                        $scope.bookmarks = data.payload.bookmarks;
                        $scope.showProgressbar = false;
                        $scope.noBookmarks = false;
                        break;
                    case "noBookmarks":
                        $scope.showProgressbar = false;
                        $scope.noBookmarks = true;
                        break;
                }
            }
        });

        $scope.fetchAllBookmarks = function() {
            $scope.$emit(
                '$messageOutgoing',
                angular.toJson({
                    target: "BookmarksManager",
                    intent: "fetch",
                    payload: {}
                })
            );
            console.log("called fetchAllBookmarks.");
        };

        $scope.fetchAllBookmarks();
    };

    app.controller("BookmarkController", ['$scope', BookmarkController]);

}());
