'use strict';

angular.module('mean.ddb').factory('DailyAnalysis', ['$http',
    function ($http) {
        var dao = {};

        dao.get = function (userId, fromDate, toDate) {
            return $http({
                url: '/api/dailyAnalysis/' + userId,
                method: 'GET',
                params: {
                    fromDate: fromDate,
                    toDate: toDate
                }
            });
        };
        return dao;
    }
]);
