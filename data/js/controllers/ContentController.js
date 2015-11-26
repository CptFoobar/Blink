(function() {

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
            var index = $scope.items.indexOf(item);
            if (index >= 0) {
                $scope.items.splice(index, 1);
                $scope.alerts.push({type:"danger", msg:"Deleted '" + item.title + "' from your feed list."});
            }
        }

        $scope.addSourceItem = function(addItem) {
            console.log("Adding " + JSON.stringify(addItem));
        }

        $scope.addContent = function() {

            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'addContent.html',
                controller: 'AddContentController'
            });

            modalInstance.result.then(function(addItem) {
                $scope.addSourceItem(addItem);
                $scope.alerts.push({
                    type: "success",
                    msg: addItem.title + " has been added to your feed list."
                });
            }, function() {
                console.log('Modal dismissed at: ' + new Date());
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

    var AddContentController = function($scope, $uibModalInstance) {
        $scope.addSource = function(item) {
            console.log("item to add is: " + JSON.stringify(item));
            $uibModalInstance.close(item);
        };

        $scope.log = function() {
            console.log("clicked");
        }

        $scope.getSourceSuggestions = function(query) {
            $scope.suggestions = [{
                title: "Engadget",
                websiteUrl: "http://www.engadget.com",
                streamId: "feed/http://www.engadget.com/rss-full.xml",
                icon: "http://storage.googleapis.com/site-assets/4i-1vhCwmRRLfmB7ypTnMh-ZKSvsz6Rgf0lfR0WWb0w_visual-150719f6d2d",
                description: "lorem ipsum dolor set amit",
                tags: ["tech"],
                wanted: true
            }, {
                title: "Techcrunch",
                websiteUrl: "http://techcrunch.com",
                streamId: "feed/http://feeds.feedburner.com/Techcrunch",
                icon: "http://storage.googleapis.com/site-assets/Xne8uW_IUiZhV1EuO2ZMzIrc2Ak6NlhGjboZ-Yk0rJ8_visual-14e42a4d997",
                description: "lorem ipsum dolor set amit",
                tags: ["tech"],
                wanted: true
            }, {
                title: "Gizmodo",
                websiteUrl: "http://gizmodo.com",
                streamId: "feed/http://feeds.gawker.com/gizmodo/full",
                icon: "http://storage.googleapis.com/site-assets/YgTD2rF1XSAfR77lKtxrTwuR-azzbzQhUxfiRyg1u0w_visual-14cde04613e",
                description: "lorem ipsum dolor set amit",
                tags: ["tech"],
                wanted: true
            }, {
                title: "Dribbble",
                websiteUrl: "https://dribbble.com/",
                streamId: "feed/http://dribbble.com/shots/popular.rss",
                icon: "http://storage.googleapis.com/site-assets/BnJ8HLdN6KkB0LbmwfVmx3aWGMAdrc5NScyF4JLTJnM_visual-14a5c737fe2",
                description: "lorem ipsum dolor set amit",
                tags: ["art"],
                wanted: true
            }];
            return $scope.suggestions;
        };
    };

    app.controller('ContentController', ContentController);
    app.controller('AddContentController', AddContentController);
    app.controller('DeleteModalController', DeleteModalController);

}());
