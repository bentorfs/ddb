'use strict';

angular.module('mean.ddb').controller('DdbNewsController', ['$rootScope', '$scope', 'MeanUser',
    function ($rootScope, $scope, MeanUser) {
        $scope.user = MeanUser;
    }
]);

