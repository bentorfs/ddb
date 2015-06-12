'use strict';

angular.module('mean.ddb').controller('DdbGroupController', ['$scope', '$stateParams', '$state', '$rootScope', 'User', 'Group', '$q',
    function ($scope, $stateParams, $state, $rootScope, User, Group, $q) {

        $scope.usersToInvite = [];
        $scope.inviteUsers = function () {
            var promises = [];
            _.forEach($scope.usersToInvite, function (userToInvite) {
                promises.push(Group.addInvitation($stateParams.groupId, userToInvite._id));
            });

            $q.all(promises).then(function () {
                $scope.loadGroup();
                $scope.usersToInvite = [];
            });
        };

        $scope.uninviteUser = function (userId) {
            Group.removeInvitation($stateParams.groupId, userId).success(function () {
                $scope.loadGroup();
            })
        };

        $scope.loadGroup = function () {
            Group.getGroup($stateParams.groupId).success(function (group) {
                $scope.group = group;
            });
        };

        $scope.loadRanking = function () {
            Group.getRanking($stateParams.groupId).success(function (ranking) {
                $scope.ranking = ranking;
            });
        };

        $scope.leaveGroup = function () {
            Group.leaveGroup($stateParams.groupId).success(function () {
                $state.go('managegroups');
                $rootScope.$emit('beerkeeper.groups.update');
            })
        };

        $scope.loadGroup();
        $scope.loadRanking();
    }
]);

