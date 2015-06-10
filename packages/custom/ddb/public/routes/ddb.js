'use strict';

angular.module('mean.ddb').config(['$stateProvider',
    function ($stateProvider) {
        $stateProvider.state('measurements', {
            url: '/ddb/measurements',
            templateUrl: 'ddb/views/measurements.html'
        });
        $stateProvider.state('profile', {
            url: '/ddb/profile',
            templateUrl: 'ddb/views/profile.html'
        });
    }
]);

angular.module('mean.ddb')
    .config(['$viewPathProvider', function ($viewPathProvider) {
        $viewPathProvider.override('system/views/header.html', 'ddb/views/header.html');
        $viewPathProvider.override('system/views/index.html', 'ddb/views/measurements.html');
        $viewPathProvider.override('users/views/login.html', 'ddb/views/login.html');
        $viewPathProvider.override('users/views/register.html', 'ddb/views/register.html');
    }]);