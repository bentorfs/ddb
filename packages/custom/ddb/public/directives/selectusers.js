'use strict';

angular.module('mean.ddb').directive('selectUsers', function () {
    return {
        restrict: 'E',
        scope: {
            selection: '='
        },
        templateUrl: 'ddb/views/templates/select-users.html',
        controller: ['$scope', 'User', 'MeanUser', function ($scope, User, MeanUser) {

            $scope.users = [];
            $scope.loadUsers = function () {
                User.list().success(function (users) {
                    $scope.users = _.filter(users, function (user) {
                        return user.username != MeanUser.user.username;
                    });
                });
            };
            $scope.loadUsers();

            $scope.toggleUser = function (userId) {
                if ($scope.selection.indexOf(userId) == -1) {
                    $scope.selection.push(userId);
                } else {
                    _.remove($scope.selection, function (el) {
                        return el == userId;
                    })
                }
            };

        }]
    };
});