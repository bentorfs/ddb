'use strict';

angular.module('mean.ddb').factory('Profile', ['$http',
    function ($http) {

        var dao = {};

        dao.getUser = function (userId) {
            return $http({
                url: '/api/profile/' + userId,
                method: 'GET'
            });
        };

        dao.getFrequentDrinks = function (userId) {
            return $http({
                url: '/api/profile/' + userId + '/drinks/frequent',
                method: 'GET'
            });
        };

        return dao;
    }
]);
