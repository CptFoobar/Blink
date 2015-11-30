(function() {
    'use strict'
    // ^ since we cannot (yet) use classes without strict mode

    var app = angular.module('blink');

    var ContentController = function($scope, $uibModal) {

        $scope.alerts = [];

        $scope.items = [];

        var TAG = "ContentController";

        $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
        };

        $scope.updatePrefs = function(msg) {
            console.log('toggled ' + msg);
        }

        $scope.deleteItem = function(item) {
            console.log('deleting ' + JSON.stringify(item));
            var index = indexOf(item);
            if (index >= 0) {
                $scope.$emit(
                    '$messageOutgoing',
                    angular.toJson({
                        target: "ContentManager",
                        intent: "delete",
                        payload: {
                            removeItem: item
                        }
                    })
                );
                $scope.items.splice(index, 1);
                $scope.alerts.push({
                    type: "danger",
                    msg: "Deleted '" + item.title + "' from your feed list."
                });
            }
        }

        $scope.addSourceItem = function(addItem) {
            console.log("adding new item " + JSON.stringify(addItem));
            var newFeedItem = {
                title: addItem.title,
                websiteUrl: addItem.website,
                streamId: addItem.feedId,
                icon: addItem.visualUrl,
                description: addItem.description,
                tags: addItem.deliciousTags,
                wanted: true
            };

            $scope.$emit(
                '$messageOutgoing',
                angular.toJson({
                    target: "ContentManager",
                    intent: "add",
                    payload: {
                        addItem: newFeedItem
                    }
                })
            );

            if(indexOf(newFeedItem) === -1) {
                // New Source
                $scope.items.push(newFeedItem);
                $scope.alerts.push({
                    type: "success",
                    msg: newFeedItem.title + " has been added to your feed list."
                });
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
                templateUrl: 'addContent.html',
                controller: 'AddContentController'
            });

            modalInstance.result.then(function(addItem) {
                $scope.addSourceItem(addItem);
            }, function() {
                //console.log('Nothing added');
            });
        };


        $scope.promptDelete = function(idToDelete) {

            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'confirmDelete.html',
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
                console.log('Modal dismissed at: ' + new Date());
            });
        };

        $scope.getContentList = function() {
            $scope.$emit(
                '$messageOutgoing',
                angular.toJson({
                    target: "ContentManager",
                    intent: "fetch",
                    payload: {}
                })
            );
            console.log("called getContentList.");
        };


        $scope.getColumns = function() {
            var w = window.innerWidth;
            if (w > 1300) return 5
            else if (w < 1300 && w > 1000) return 4;
            else if (w < 1000 && w > 600) return 3;
            else if (w < 600 && w > 400) return 2;
            else return 1;
        };

        $scope.$root.$on('$messageIncoming', function(event, data) {
            data = angular.fromJson(data);
            if (data.target == "ContentController") {
                console.log(TAG + "message for CC");
                switch (data.intent) {
                    case "contentList":
                        console.log("loading content list");
                        $scope.items = data.payload;
                        break;
                }
            }
        });

        $scope.getContentList();

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

    var AddContentController = function($scope, $uibModalInstance, $q) {

        $scope.showProgressbar = false;

        /* TODO: Check for ES6 support in Firefox and change this to class */
        /* Create a custom promise for async suggestions */
        function ContentPromise() {
            this.deferred = undefined;
        }

        ContentPromise.prototype.setPromise = function(promise) {
            this.deferred = promise;
        }
        ContentPromise.prototype.resetPromise = function() {
            this.deferred = undefined;
        }
        ContentPromise.prototype.resolveContent = function(data) {
            this.deferred.resolve(data);
        }
        ContentPromise.prototype.rejectContent = function(data) {
            this.deferred.reject(data);
        }
        ContentPromise.prototype.getPromise = function() {
            return this.deferred.promise;
        }

        var contentPromise = new ContentPromise();

        $scope.addSource = function(item) {
            $uibModalInstance.close(item);
        };

        var contentPromise = new ContentPromise();

        $scope.getSourceSuggestions = function(query) {
            console.log("Querying for: " + query);
            // Show progressbar
            $scope.showProgressbar = true;
            contentPromise.setPromise($q.defer());
            $scope.$emit(
                '$messageOutgoing',
                angular.toJson({
                    target: "ContentManager",
                    intent: "search",
                    payload: {
                        query: query
                    }
                })
            );
            console.log("called getSourceSuggestions.");
            return contentPromise.getPromise()
                .then(function(suggestions) {
                    //console.log(JSON.stringify(suggestions));
                    return suggestions;
                });
        };

        $scope.$root.$on('$messageIncoming', function(event, data) {
            data = angular.fromJson(data);
            if (data.target == "ContentController") {
                console.log("message for CC");
                switch (data.intent) {
                    case "suggestionList":
                        console.log("loading suggestions");
                        // Hide progressbar
                        $scope.showProgressbar = false;
                        // TODO: Filter (or mark) results already in feed list
                        contentPromise.resolveContent(data.payload);
                        break;
                }
            }
        });

    };

    app.controller('ContentController', ['$scope', '$uibModal',
                                                        ContentController]);
    app.controller('AddContentController', ['$scope', '$uibModalInstance',
                                                '$q', AddContentController]);
    app.controller('DeleteModalController', ['$scope', '$uibModalInstance',
                                        'toDelete', DeleteModalController]);

}());
