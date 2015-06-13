'use strict';

angular.module('mean.ddb').factory('Measurement', ['$http',
    function ($http) {
        var dao = {};

        dao.list = function () {
            return $http({
                url: '/api/measurement',
                method: 'GET',
                params: {}
            });
        };

        dao.update = function (measurement) {
            return $http({
                url: '/api/measurement',
                method: 'POST',
                data: measurement
            });
        };

        return dao;
    }
]);
