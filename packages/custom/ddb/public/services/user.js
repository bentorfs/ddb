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

        userDao.get = function (userId) {
            return $http({
                url: '/api/users/' + userId,
                method: 'GET',
                params: {}
            });
        };

        userDao.purge = function () {
            return $http({
                url: '/api/users/data',
                method: 'DELETE',
                params: {}
            });
        };

        return userDao;
    }
]);
