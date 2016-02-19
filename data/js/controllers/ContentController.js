(function() {
    'use strict'

    var app = angular.module('blink');

    var ContentController = function($scope, $uibModal, $http) {

        $scope.alerts = [];

        $scope.items = [];

        $scope.showProgressbar = true;
        $scope.emptyContentList = false;

        var TAG = "ContentController";

        chrome.storage.sync.get("feedList", function(feedList) {
            $scope.showProgressbar = false;
            if (chrome.runtime.lastError || feedList.feedList == "undefined" ||
                typeof feedList.feedList === "undefined" ||
                feedList.feedList.length === 0) {
                $scope.emptyContentList = true;
                return;
            } else {
                $scope.items.splice(0, $scope.items.length);
                $scope.items = feedList.feedList;
            }
        });

        $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
        };

        $scope.updatePrefs = function(successAlert, failureAlert) {
            chrome.storage.sync.set({
                "feedList": $scope.items
            }, function() {
                if (chrome.runtime.lastError) {
                    if (successAlert)
                        $scope.alerts.push(successAlert);
                    return;
                } else {
                    if (failureAlert)
                        $scope.alerts.push(failureAlert)
                }
            });
        };

        $scope.toggleItem = function() {
            $scope.updatePrefs(null, null);
        };

        $scope.deleteItem = function(item) {
            // console.log('deleting ' + JSON.stringify(item));
            var index = indexOf(item);
            if (index >= 0) {
                $scope.items.splice(index, 1);
                $scope.updatePrefs({
                    type: "danger",
                    msg: "Failed to delete " + item.title + " from your feed list."
                }, {
                    type: "danger",
                    msg: "Deleted '" + item.title + "' from your feed list."
                });
                if ($scope.items.length === 0) $scope.emptyContentList = true;
            }
        }

        $scope.addSourceItem = function(addItem) {
            // console.log("adding new item " + JSON.stringify(addItem));
            if (typeof addItem == "undefined" ||
                addItem.title.trim().length === 0 ||
                addItem.title.trim() === "undefined")
                return;
            var newFeedItem = {
                title: addItem.title,
                websiteUrl: addItem.website,
                streamId: addItem.feedId,
                icon: addItem.visualUrl,
                description: addItem.description,
                tags: addItem.deliciousTags,
                wanted: true
            };
            $scope.lastUsed = newFeedItem.title;
            if (indexOf(newFeedItem) === -1) {
                // New Source
                $scope.items.push(newFeedItem);

                $scope.updatePrefs({
                    type: "danger",
                    msg: "Failed to add " + newFeedItem.title + " to your feed list."
                }, {
                    type: "success",
                    msg: newFeedItem.title + " has been added to your feed list."
                });

                if ($scope.emptyContentList) $scope.emptyContentList = false;

            } else {
                // Source already exists
                $scope.alerts.push({
                    type: "warning",
                    msg: newFeedItem.title + " is already a source."
                });
            }
        };

        $scope.addContent = function() {

            var modalInstance = $uibModal.open({
                animation: true,
                size: 'lg',
                templateUrl: 'markup/addContent.html',
                controller: 'AddContentController'
            });

            modalInstance.result.then(function(addItem) {
                $scope.addSourceItem(addItem);
            }, function() {
                //console.log('Nothing added');
            });
        };


        $scope.promptDelete = function(item) {
            var idToDelete = indexOf(item);
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'markup/confirmDelete.html',
                controller: 'DeleteModalController',
                resolve: {
                    toDelete: function() {
                        return $scope.items[idToDelete];
                    }
                }
            });

            modalInstance.result.then(function(deleteItem) {
                $scope.deleteItem(deleteItem);
            }, function() {
                // console.log('Modal dismissed at: ' + new Date());
            });
        };

        $scope.getColumnCount = function() {
            var w = window.innerWidth;
            if (w > 1300) return 5
            else if (w < 1300 && w > 1000) return 4;
            else if (w < 1000 && w > 600) return 3;
            else if (w < 600 && w > 400) return 2;
            else return 1;
        };

        $scope.getRowCount = function() {
            return Math.ceil($scope.items.length / $scope.getColumnCount());
        }

        $scope.getTitle = function(title) {
            if (title.length > 10)
                title = title.substring(0, 10) + "...";
            return title;
        };

        // Helper function to get index of object
        var indexOf = function(o) {
            for (var i = 0; i < $scope.items.length; i++) {
                if ($scope.items[i].title == o.title &&
                    $scope.items[i].websiteUrl == o.websiteUrl) {
                    return i;
                }
            }
            return -1;
        };

    };

    var DeleteModalController = function($scope, $uibModalInstance, toDelete) {
        $scope.toDelete = toDelete;

        $scope.ok = function() {
            $uibModalInstance.close($scope.toDelete);
        };

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };
    };

    var AddContentController = function($scope, $uibModalInstance, $q, $http) {

        $scope.showProgressbar = false;

        $scope.addSource = function(item) {
            $uibModalInstance.close(item);
        };

        $scope.getSourceSuggestions = function(query) {
            // console.log("Querying for: " + query);
            // Show progressbar
            $scope.showProgressbar = true;
            var url = 'https://cloud.feedly.com/v3/search/feeds?q=';
            url += encodeURIComponent(query);
            url += '&count=12';

            return $http({
                url: url,
                method: 'GET',
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET',
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'

                }
            }).then(function(response) {
                return response.data.results;
            });
        };

    };

    app.controller('ContentController', ['$scope', '$uibModal', '$http',
        ContentController
    ]);
    app.controller('AddContentController', ['$scope', '$uibModalInstance', '$q',
        '$http', AddContentController
    ]);
    app.controller('DeleteModalController', ['$scope', '$uibModalInstance',
        'toDelete', DeleteModalController
    ]);

}());
