'use strict';

angular.module('mean.ddb').controller('DdbToolsController', ['$scope', '$state', '$http', 'User', 'Measurement',
    function ($scope, $state, $http, User, Measurement) {


        $scope.firstDay = moment('05/07/2015', 'MM/DD/YYYY').toDate();

        $scope.import = function () {

            var data = $scope.importData;

            var arrayOfLines = data.match(/[^\r\n]+/g);
            var currentDate = moment.utc('05/07/2015', 'MM/DD/YYYY');

            angular.forEach(arrayOfLines, function (record) {

                if (currentDate >= moment($scope.firstDay)) {


                    var entries = record.split(/\t/);


                    var pilsner = entries[0] || 0;
                    var strongbeer = entries[1] || 0;
                    var wine = entries[2] || 0;
                    var liquor = entries[3] || 0;

                    var measurement = {
                        date: currentDate.valueOf(),
                        pilsner: pilsner,
                        strongbeer: strongbeer,
                        wine: wine,
                        liquor: liquor
                    };
                    Measurement.update(measurement);
                    console.log('Imported data for ' + currentDate.format());

                }
                currentDate = currentDate.add(1, 'days');
            });

            console.log('Done');
            $state.go('measurements');
        };

        $scope.deleteAll = function () {
            User.purge().then(function () {
                $state.go('measurements');
            });
        };

        $scope.rebuild = function () {
            $http({
                url: '/api/rebuild',
                method: 'POST',
                params: {}
            }).success(function () {
                alert('Rebuild triggered');
            });
        }

    }
]);

