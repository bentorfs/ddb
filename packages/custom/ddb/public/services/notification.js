'use strict';

angular.module('mean.ddb').factory('Notification', ['$http',
    function ($http) {
        var dao = {};

        dao.listNotifications = function () {
            return $http({
                url: '/api/notification',
                method: 'GET'
            });
        };

        dao.markAsRead = function (notificationId) {
            return $http({
                url: '/api/notification/' + notificationId,
                method: 'DELETE'
            });
        };

        return dao;
    }
]);
