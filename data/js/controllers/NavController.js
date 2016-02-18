(function(){

    var app = angular.module('blink');

    var NavController =  function($scope, $http, $uibModal) {
        $scope.searchbarOpen = false;
        $scope.navbarCollapsed = true;
        $scope.selected = undefined;

        // Any function returning a promise object can be used to load values asynchronously
        $scope.getSuggestions = function(toComplete) {
            var url = 'http://suggestqueries.google.com/complete/search?';
            url += 'client=chrome&hl=en&q='
            url += encodeURIComponent(toComplete);

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
                for(i = 0; i < response.data[1].length; i++)
                    if(response.data[1][i].length >= 50)
                        response.data[1][i] = response.data[1][i].substring(0, 47) + "...";
                return response.data[1].slice(0, 10);
            });
        };

        $scope.google = function(query, selection) {
            // console.log("q: " + query + " s: " + selection);
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
               templateUrl: 'markup/showYourLove.html'
           });

           modalInstance.result.then(function(deleteItem) {
               //$scope.deleteItem(deleteItem);
               // console.log('SYL Modal returned');
           }, function() {
               // console.log('SYL Modal dismissed at: ' + new Date());
           });
       };
    };

    app.controller('NavController', ['$scope', '$http', '$uibModal', NavController]);
}());
