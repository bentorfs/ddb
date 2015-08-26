'use strict';

angular.module('mean.ddb').factory('Drink', ['$http',
    function ($http) {

        var dao = {};

        dao.list = function (name, skip, limit) {
            return $http({
                url: '/api/drink',
                method: 'GET',
                params: {
                    name: name,
                    skip: skip,
                    limit: limit
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

        dao.replace = function (drinkId, replacementId) {
            return $http({
                url: '/api/drink/' + drinkId,
                method: 'DELETE',
                params: {
                    replacementId: replacementId
                }
            });
        };

        return dao;
    }
]);
