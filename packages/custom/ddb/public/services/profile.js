'use strict';

angular.module('mean.ddb').factory('Profile', ['$http',
    function ($http) {
        var dao = {};

        dao.get = function (userId) {
            return $http({
                url: '/api/profile/' + userId,
                method: 'GET'
            });
        };

        return dao;
    }
]);
