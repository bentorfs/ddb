'use strict';

angular.module('mean.ddb').controller('DdbNewsController', ['$rootScope', '$scope', 'smoothScroll', 'MeanUser', 'Measurement',
    function ($rootScope, $scope, smoothScroll, MeanUser, Measurement) {

        $scope.today = moment().valueOf();

        $scope.loadData = function () {
            if ($scope.user._id) {
                Measurement.get(moment().valueOf()).success(function (data) {
                    $scope.measurement = data;
                });
            }
        };

        $scope.onDrinkTracked = function () {
            $scope.loadData();
            $scope.scrollTo('track-more');
        };

        $scope.scrollTo = function (location) {
            smoothScroll(document.getElementById(location), {offset: 55});
        };

        $scope.removeConsumption = function (consumption) {
            Measurement.removeConsumption(moment().valueOf(), consumption._id
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

