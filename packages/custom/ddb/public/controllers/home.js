'use strict';

angular.module('mean.ddb').controller('DdbHomeController', ['$rootScope', '$scope', '$location',
    function ($rootScope, $scope, $location) {
        $rootScope.$on('loggedin', function () {
            $location.url('/ddb/dashboard');
        });
    }
]);

