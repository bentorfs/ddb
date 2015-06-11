'use strict';

angular.module('mean.ddb').factory('Group', ['$http',
    function ($http) {
        var dao = {};

        dao.get = function (id) {
            return $http({
                url: '/api/group/' + id,
                method: 'GET'
            });
        };

        dao.create = function (group) {
            return $http({
                url: '/api/group',
                method: 'POST',
                data: group
            });
        };

        dao.list = function () {
            return $http({
                url: '/api/group',
                method: 'GET'
            });
        };

        return dao;
    }
]);
