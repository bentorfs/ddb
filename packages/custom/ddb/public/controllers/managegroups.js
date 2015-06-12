'use strict';

angular.module('mean.ddb').controller('DdbManageGroupsController', ['$scope', 'Global', '$state', '$rootScope', 'User', 'Group', 'MeanUser',
    function ($scope, $Global, $state, $rootScope, User, Group, MeanUser) {

        $scope.loadUsers = function () {
            User.list().success(function (users) {
                $scope.users = _.filter(users, function (user) {
                    return user.username != MeanUser.user.username;
                });
            });
        };

        $scope.loadInvitations = function () {
            Group.listInvitations().success(function (invitation) {
                $scope.invitations = invitation;
            });
        };

        $scope.acceptInvitation = function (groupId) {
            Group.acceptInvitation(groupId).success(function () {
                $scope.loadInvitations();
                $rootScope.$emit('beerkeeper.groups.update');
            })
        };

        $scope.rejectInvitation = function (groupId) {
            Group.rejectInvitation(groupId).success(function () {
                $scope.loadInvitations();
            })
        };

        $scope.usersToInvite = [];

        $scope.createGroup = function () {
            Group.createGroup({
                name: $scope.groupName,
                invitations: _.pluck($scope.usersToInvite, 'id')
            }).success(function (data) {
                $rootScope.$emit('beerkeeper.groups.update');
                $state.go('group', {groupId: data._id});
            })
        };

        $scope.loadUsers();
        $scope.loadInvitations();
    }
]);

