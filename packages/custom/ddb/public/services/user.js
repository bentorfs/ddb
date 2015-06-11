'use strict';

angular.module('mean.ddb').factory('User', ['$http',
    function ($http) {
        var userDao = {};

        userDao.list = function () {
            return $http({
                url: '/api/users',
                method: 'GET',
                params: {}
            });
        };

        return userDao;
    }
]);
