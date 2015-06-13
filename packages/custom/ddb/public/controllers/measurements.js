'use strict';

/* jshint -W098 */
angular.module('mean.ddb').controller('DdbMeasurementsController', ['$scope', 'Global', 'Measurement', 'MeanUser',
    function ($scope, Global, Measurement, MeanUser) {

        $scope.user = MeanUser;

        $scope.loadData = function () {
            Measurement.list().success(function (measurements) {
                $scope.measurements = measurements;
                $scope.selectedMeasurement = _.last($scope.measurements);
            });
        };

        $scope.status = {};
        $scope.save = function (measurement) {
            if ($scope.isValid(measurement)) {
                $scope.status[measurement.date] = 'saving';
                Measurement.update(measurement).success(function (response) {
                    console.log('saved');
                    $scope.status[measurement.date] = 'saved';
                }).error(function () {
                    $scope.status[measurement.date] = 'failed';
                });
            } else {
                $scope.status[measurement.date] = 'failed';
            }
        };

        $scope.addPilsner = function (measurement, amount) {
            measurement.pilsner = measurement.pilsner + amount;
            $scope.save(measurement);
        };

        $scope.addStrongbeer = function (measurement, amount) {
            measurement.strongbeer = measurement.strongbeer + amount;
            $scope.save(measurement);
        };

        $scope.addWine = function (measurement, amount) {
            measurement.wine = measurement.wine + amount;
            $scope.save(measurement);
        };

        $scope.addLiquor = function (measurement, amount) {
            measurement.liquor = measurement.liquor + amount;
            $scope.save(measurement);
        };

        $scope.selectMeasurement = function (measurement) {
            $scope.selectedMeasurement = measurement;
        };

        $scope.isToday = function (date) {
            return moment.utc(date, 'YYYY-MM-DD hh:mm:ss').startOf('day').valueOf() === moment.utc().startOf('day').valueOf();
        };

        $scope.isValid = function (measurement) {
            measurement.pilsner = measurement.pilsner || 0;
            measurement.strongbeer = measurement.strongbeer || 0;
            measurement.wine = measurement.wine || 0;
            measurement.liquor = measurement.liquor || 0;
            return (measurement.pilsner >= 0) && (measurement.strongbeer >= 0) && (measurement.wine >= 0) && (measurement.liquor >= 0);
        };

        $scope.loadData();
    }
]);


angular.module('mean.ddb').filter('startFrom', function () {
    return function (input, start) {
        if (input) {
            start = +start; //parse to int
            return input.slice(start);
        } else {
            return [];
        }
    }
});