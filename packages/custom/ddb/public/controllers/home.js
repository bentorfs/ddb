'use strict';

angular.module('mean.ddb').controller('DdbHomeController', ['$rootScope', '$scope', '$location', '$window',
    function ($rootScope, $scope, $location, $window) {
        $rootScope.$on('loggedin', function () {
            $location.url('/ddb/dashboard');
        });
    }
]);
