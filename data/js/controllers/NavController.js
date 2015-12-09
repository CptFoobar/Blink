(function(){

    var app = angular.module('blink');

    var NavController =  function($scope, $http, $uibModal) {
        $scope.searchbarOpen = false;
        $scope.navbarCollapsed = true;
        $scope.selected = undefined;

        // Any function returning a promise object can be used to load values asynchronously
        $scope.getSuggestions = function(toComplete) {
            var url = 'http://suggestqueries.google.com/complete/search?';
            url += 'callback=JSON_CALLBACK&client=firefox&hl=en&q='
            url += encodeURIComponent(toComplete);
            $http.defaults.useXDomain = true;

            return $http({
                url: url,
                method: 'JSONP',
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET',
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'

                }
            }).then(function(response) {
                for(i = 0; i < response.data[1].length; i++)
                    if(response.data[1][i].length >= 50)
                        response.data[1][i] = response.data[1][i].substring(0, 47) + "...";
                return response.data[1];
            });
            //TODO: Succes and Error checking
        };

        $scope.google = function(query, selection) {
            console.log("q: " + query + " s: " + selection);
            if (selection.length < 1)
                if (typeof query != 'undefined' && query.length !== 0)
                    window.location = "https://www.google.com/search?q=" +
                    encodeURIComponent(query);
                else window.location = "https://www.google.com/";
            else window.location = "https://www.google.com/search?q=" +
                encodeURIComponent(selection);
        };

        $scope.toggleSearchbar = function() {
            $scope.searchbarOpen= !$scope.searchbarOpen;
        };

        $scope.showYourLove = function() {

           var modalInstance = $uibModal.open({
               animation: true,
               templateUrl: 'resource://blink/data/markup/showYourLove.html'
           });

           modalInstance.result.then(function(deleteItem) {
               //$scope.deleteItem(deleteItem);
               console.log('SYL Modal returned');
           }, function() {
               console.log('SYL Modal dismissed at: ' + new Date());
           });
       };
    };

    app.controller('NavController', ['$scope', '$http', '$uibModal', NavController]);
}());
