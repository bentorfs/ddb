'use strict';

angular.module('mean.ddb').controller('DdbGroupController', ['$scope', '$stateParams', 'User', 'Group', 'MeanUser', 'Invitation',
    function ($scope, $stateParams, User, Group, MeanUser, Invitation) {

        Group.get($stateParams.groupId).success(function (group) {
            $scope.group = group;
        });


    }
]);

