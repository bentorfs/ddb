'use strict';

angular.module('mean.ddb').controller('DdbManageGroupsController', ['$scope', 'Global', '$state', '$rootScope', 'User', 'Group', 'MeanUser', 'Invitation',
    function ($scope, $Global, $state, $rootScope, User, Group, MeanUser, Invitation) {

        $scope.loadUsers = function () {
            User.list().success(function (users) {
                $scope.users = _.filter(users, function (user) {
                    return user.username != MeanUser.user.username;
                });
            });
        };

        $scope.loadInvitations = function () {
            Invitation.list().success(function (invitation) {
                $scope.invitations = invitation;
            });
        };

        $scope.acceptInvitation = function (groupId) {
            Invitation.accept(groupId).success(function () {
                $scope.loadInvitations();
                $rootScope.$emit('beerkeeper.groups.update');
            })
        };

        $scope.rejectInvitation = function (groupId) {
            Invitation.reject(groupId).success(function () {
                $scope.loadInvitations();
            })
        };

        $scope.usersToInvite = [];

        $scope.createGroup = function () {
            Group.create({
                name: $scope.groupName,
                invitations: $scope.usersToInvite
            }).success(function (data) {
                $rootScope.$emit('beerkeeper.groups.update');
                $state.go('group', {groupId: data._id});
            })
        };

        $scope.loadUsers();
        $scope.loadInvitations();
    }
]);

