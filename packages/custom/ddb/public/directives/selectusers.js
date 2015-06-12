'use strict';

angular.module('mean.ddb').directive('selectUsers', function () {
    return {
        restrict: 'E',
        scope: {
            selection: '='
        },
        templateUrl: 'ddb/views/templates/select-users.html',
        controller: ['$scope', '$q', 'User', 'MeanUser', function ($scope, $q, User, MeanUser) {

            $scope.options = function () {
                return $q(function (resolve, reject) {
                    User.list().success(function (users) {
                        resolve(_.filter(users, function (user) {
                            return user.username != MeanUser.user.username;
                        }))
                    });
                });
            };

        }]
    };
});