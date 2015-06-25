'use strict';

angular.module('mean.ddb').controller('DdbNewsController', ['$rootScope', '$scope', 'smoothScroll', 'MeanUser', 'Measurement',
    function ($rootScope, $scope, smoothScroll, MeanUser, Measurement) {

        $scope.today = moment.utc().valueOf();

        $scope.loadData = function () {
            if ($scope.user._id) {
                Measurement.get(moment.utc().valueOf()).success(function (data) {
                    $scope.measurement = data;
                });
            }
        };

        $scope.onDrinkTracked = function () {
            $scope.loadData();
            $scope.scrollTo('today-consumptions');
        };

        $scope.scrollTo = function (location) {
            if (window.mobilecheck()) {
                smoothScroll(document.getElementById(location), {offset: 55});
            }
        };

        $scope.removeConsumption = function (consumption) {
            Measurement.removeConsumption(moment.utc().valueOf(), consumption._id
            ).success(function (data) {
                    $scope.loadData();
                });
        };

        $scope.user = MeanUser.get();
        $rootScope.$on('loggedin', function () {
            $scope.user = MeanUser.get();
            $scope.loadData();
        });
        $scope.loadData();

    }
]);

