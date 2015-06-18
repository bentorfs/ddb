'use strict';

angular.module('mean.ddb').factory('Measurement', ['$http',
    function ($http) {
        var dao = {};

        dao.list = function () {
            return $http({
                url: '/api/measurement',
                method: 'GET'
            });
        };

        dao.get = function (date) {
            return $http({
                url: '/api/measurement/' + date,
                method: 'GET'
            });
        };

        dao.update = function (measurement) {
            return $http({
                url: '/api/measurement',
                method: 'POST',
                data: measurement
            });
        };

        dao.addConsumption = function (date, consumption) {
            return $http({
                url: '/api/measurement/' + date + '/consumptions',
                method: 'POST',
                data: consumption
            });
        };

        dao.removeConsumption = function (date, consumptionId) {
            return $http({
                url: '/api/measurement/' + date + '/consumptions',
                method: 'DELETE',
                params: {
                    consumptionId: consumptionId
                }
            });
        };

        return dao;
    }
]);
