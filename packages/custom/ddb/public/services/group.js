'use strict';

angular.module('mean.ddb').factory('Group', ['$http',
    function ($http) {
        var dao = {};

        dao.getGroup = function (id) {
            return $http({
                url: '/api/group/' + id,
                method: 'GET'
            });
        };

        dao.createGroup = function (group) {
            return $http({
                url: '/api/group',
                method: 'POST',
                data: group
            });
        };

        dao.leaveGroup = function (groupId) {
            return $http({
                url: '/api/group/' + groupId + '/member',
                method: 'DELETE'
            });
        };

        dao.listGroups = function () {
            return $http({
                url: '/api/group',
                method: 'GET'
            });
        };

        dao.listInvitations = function () {
            return $http({
                url: '/api/invitation',
                method: 'GET'
            });
        };

        dao.acceptInvitation = function (groupId) {
            return $http({
                url: '/api/group/' + groupId + '/member',
                method: 'POST'
            });
        };

        dao.rejectInvitation = function (groupId) {
            return $http({
                url: '/api/group/' + groupId + '/member',
                method: 'DELETE'
            });
        };

        dao.addInvitation = function (groupId, userId) {
            return $http({
                url: '/api/group/' + groupId + '/invitation/' + userId,
                method: 'POST'
            });
        };

        dao.removeInvitation = function (groupId, userId) {
            return $http({
                url: '/api/group/' + groupId + '/invitation/' + userId,
                method: 'DELETE'
            });
        };


        return dao;
    }
]);
