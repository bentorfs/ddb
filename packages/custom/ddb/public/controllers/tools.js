'use strict';

angular.module('mean.ddb').controller('DdbToolsController', ['$scope', '$state', '$http', 'User', 'MeanUser', '$stateParams',
    function ($scope, $state, $http, User, MeanUser, $stateParams) {

        $scope.user = MeanUser;

        $scope.purgeUser = function () {
            User.delete($stateParams.userId).then(function () {
                localStorage.removeItem('JWT');
                $state.go('home');
            });
        };

        $scope.rebuild = function () {
            $http({
                url: '/api/tools/rebuild/user/' + $stateParams.userId,
                method: 'POST',
                params: {}
            }).success(function () {
                alert('Rebuild done');
            });
        };

        $scope.rebuildAll = function () {
            $http({
                url: '/api/tools/rebuild',
                method: 'POST',
                params: {}
            }).success(function () {
                alert('Rebuild done');
            });
        };

    }
]);

