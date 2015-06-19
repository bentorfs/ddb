'use strict';

angular.module('mean.ddb').factory('User', ['$http',
    function ($http) {
        var userDao = {};

        userDao.list = function () {
            return $http({
                url: '/api/users',
                method: 'GET'
            });
        };

        userDao.get = function (userId) {
            return $http({
                url: '/api/users/' + userId,
                method: 'GET'
            });
        };

        userDao.delete = function () {
            return $http({
                url: '/api/users/' + userId,
                method: 'DELETE'
            });
        };

        return userDao;
    }
]);
