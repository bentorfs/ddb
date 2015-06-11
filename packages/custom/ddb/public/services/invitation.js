'use strict';

angular.module('mean.ddb').factory('Invitation', ['$http',
    function ($http) {
        var dao = {};

        dao.list = function (group) {
            return $http({
                url: '/api/invitation',
                method: 'GET'
            });
        };

        dao.accept = function (groupId) {
            return $http({
                url: '/api/invitation/' + groupId,
                method: 'POST'
            });
        };

        dao.reject = function (groupId) {
            return $http({
                url: '/api/invitation/' + groupId,
                method: 'DELETE'
            });
        };

        return dao;
    }
]);
