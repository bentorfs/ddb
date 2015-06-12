'use strict';

angular.module('mean.ddb').factory('DailyAnalysis', ['$http',
    function ($http) {
        var dao = {};

        dao.get = function (userId) {
            return $http({
                url: '/api/dailyAnalysis/' + userId,
                method: 'GET'
            });
        };
        return dao;
    }
]);
