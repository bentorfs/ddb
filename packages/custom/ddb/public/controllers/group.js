'use strict';

angular.module('mean.ddb').controller('DdbGroupController', ['$scope', '$stateParams', 'User', 'Group', 'MeanUser', 'Invitation',
    function ($scope, $stateParams, User, Group, MeanUser, Invitation) {

        $scope.usersToInvite = [];

        $scope.inviteUsers = function () {
            Invitation.add($stateParams.groupId, $scope.usersToInvite[0]).success(function () {
                $scope.loadGroup();
            })
        };

        $scope.uninviteUser = function (userId) {
            Invitation.remove($stateParams.groupId, userId).success(function () {
                $scope.loadGroup();
            })
        };

        $scope.loadGroup = function () {
            Group.get($stateParams.groupId).success(function (group) {
                $scope.group = group;
            });
        };

        $scope.addInvitation = function (groupId, userId) {
            Invitation.add(groupId, userId).success(function () {
                alert('success');
            })
        };

        $scope.loadGroup();
    }
]);

