'use strict';

/* jshint -W098 */
angular.module('mean.ddb').controller('DdbMeasurementsController', ['$scope', 'Global', 'Measurement',
    function ($scope, Global, Measurement) {

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