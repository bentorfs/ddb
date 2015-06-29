'use strict';

angular.module('mean.ddb').factory('Analysis', ['$http',
    function ($http) {
        var dao = {};

        dao.getDaily = function (userId, fromDate, toDate) {
            return $http({
                url: '/api/analysis/daily/' + userId,
                method: 'GET',
                params: {
                    fromDate: fromDate,
                    toDate: toDate
                }
            });
        };

        dao.getWeekly = function (userId) {
            return $http({
                url: '/api/analysis/weekly/' + userId,
                method: 'GET'
            });
        };

        dao.getMonthly = function (userId) {
            return $http({
                url: '/api/analysis/monthly/' + userId,
                method: 'GET'
            });
        };

        return dao;
    }
]);
