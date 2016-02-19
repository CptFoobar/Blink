(function() {

    var app = angular.module('blink');

    var HistoryController = function($scope) {
        $scope.history = [];
        $scope.showProgressbar = true;
        $scope.noHistory = false;
        var TAG = "HistoryController";

        chrome.history.search({text: '', maxResults: 500}, function (history) {
            $scope.showProgressbar = false;
            if (chrome.runtime.lastError) {
                log("Error: " + JSON.stringify(chrome.runtime.lastError));
                return;
            }

            if (history == "undefined" ||
              typeof history === "undefined" || history.length === 0) {
                $scope.noHistory = true;
                return
            }
            $scope.history = sortHistory(history);
        });

        function sortHistory(history) {
            var now = new Date().getTime();
            var today = [];
            var lastWeek = [];
            var lastMonth = [];
            var older = [];
            for (var i = 0; i < history.length; i++) {
                if (!history[i].title)
                    continue;
                var diff = (now - history[i].lastVisitTime) / 1000;
                if (diff <= 86400)
                    today.push(history[i]);
                else if (diff > 86400 && diff <= 604800)
                    lastWeek.push(history[i]);
                else if (diff > 604800 && diff <= 18144000)
                    lastMonth.push(history[i]);
                else older.push(history[i]);
            }
            return [{
                title: "Today",
                children: today
            }, {
                title: "Last Week",
                children: lastWeek
            }, {
                title: "Last Month",
                children: lastMonth
            }, {
                title: "Older",
                children: older
            }];
        }

    }

    app.controller('HistoryController', ['$scope', HistoryController]);

}());
