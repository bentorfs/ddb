'use strict';

/* jshint -W098 */
angular.module('mean.ddb').controller('DdbMeasurementsController', ['$scope', 'Global', 'Measurement', 'MeanUser',
    function ($scope, Global, Measurement, MeanUser) {

        $scope.user = MeanUser;

        Measurement.query(function (measurements) {
            $scope.measurements = measurements;
        });

        $scope.save = function (measurement) {
            measurement.$save(function (response) {
                console.log('saved');
            });
        };

        $scope.isToday = function (date) {
            return moment.utc(date, 'YYYY-MM-DD hh:mm:ss').startOf('day').valueOf() === moment.utc().startOf('day').valueOf();
        };

        $scope.isValid = function (measurement) {
            return (measurement.pilsner >= 0) && (measurement.strongbeer >= 0) && (measurement.wine >= 0) && (measurement.liquor >= 0)
                && !_.isNull(measurement.pilsner) && !_.isNull(measurement.strongbeer) && !_.isNull(measurement.wine) && !_.isNull(measurement.liquor);
        }

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