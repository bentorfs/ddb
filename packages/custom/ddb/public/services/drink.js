'use strict';

angular.module('mean.ddb').factory('Drink', ['$http',
    function ($http) {

        var dao = {};

        dao.list = function (name) {
            return $http({
                url: '/api/drink',
                method: 'GET',
                params: {
                    name: name
                }
            });
        };

        dao.add = function (drink) {
            return $http({
                url: '/api/drink',
                method: 'POST',
                data: drink
            });
        };

        dao.update = function (drinkId, drink) {
            return $http({
                url: '/api/drink/' + drinkId,
                method: 'PUT',
                data: drink
            });
        };

        dao.get = function (drinkId) {
            return $http({
                url: '/api/drink/' + drinkId,
                method: 'GET'
            });
        };

        return dao;
    }
]);