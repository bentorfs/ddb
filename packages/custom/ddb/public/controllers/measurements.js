'use strict';

angular.module('mean.ddb').controller('DdbMeasurementsController', ['$rootScope', '$scope', 'smoothScroll', 'Global', 'Measurement', 'MeanUser',
    function ($rootScope, $scope, smoothScroll, Global, Measurement, MeanUser) {

        $scope.loadData = function () {
            if ($scope.user._id) {
                Measurement.get($scope.date).success(function (data) {
                    $scope.measurement = data;
                });
            }
        };

        $scope.removeConsumption = function (consumption) {
            Measurement.removeConsumption($scope.date, consumption
            ).success(function (data) {
                    $scope.loadData();
                });
        };

        $scope.goToNextDay = function () {
            $scope.date = $scope.nextDay;
            $scope.setDays();
            $scope.loadData();
        };

        $scope.goToPrevDay = function () {
            $scope.date = $scope.prevDay;
            $scope.setDays();
            $scope.loadData();
        };

        $scope.setDays = function () {
            $scope.nextDay = moment($scope.date).add(1, 'days').valueOf();
            $scope.prevDay = moment($scope.date).subtract(1, 'days').valueOf();
            $scope.status = null;
        };

        $scope.save = function (measurement) {
            if ($scope.isValid(measurement)) {
                $scope.status = 'saving';
                Measurement.update(measurement).success(function (response) {
                    $scope.status = 'saved';
                }).error(function () {
                    $scope.status = 'failed';
                });
            } else {
                $scope.status = 'failed';
            }
        };

        $scope.onDrinkTracked = function () {
            $scope.loadData();
            smoothScroll(document.getElementById('track-more'), {offset: 55});
        };

        $scope.isValid = function (measurement) {
            measurement.pilsner = measurement.pilsner || 0;
            measurement.strongbeer = measurement.strongbeer || 0;
            measurement.wine = measurement.wine || 0;
            measurement.liquor = measurement.liquor || 0;
            return (measurement.pilsner >= 0) && (measurement.strongbeer >= 0) && (measurement.wine >= 0) && (measurement.liquor >= 0);
        };

        $scope.user = MeanUser.get();
        $rootScope.$on('loggedin', function () {
            $scope.user = MeanUser.get();
            $scope.loadData();
        });
        $scope.date = moment().subtract(1, 'days').valueOf();
        $scope.today = moment().valueOf();
        $scope.setDays();
        $scope.loadData();
    }
]);
