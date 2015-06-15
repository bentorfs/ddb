'use strict';

angular.module('mean.ddb').config(['$stateProvider',
    function ($stateProvider) {
        $stateProvider.state('news', {
            url: '/ddb/news',
            templateUrl: 'ddb/views/news.html'
        });
        $stateProvider.state('measurements', {
            url: '/ddb/measurements',
            templateUrl: 'ddb/views/measurements.html'
        });
        $stateProvider.state('profile', {
            url: '/ddb/profile/:userId',
            templateUrl: 'ddb/views/profile.html'
        });
        $stateProvider.state('managegroups', {
            url: '/ddb/managegroups',
            templateUrl: 'ddb/views/managegroups.html'
        });
        $stateProvider.state('group', {
            url: '/ddb/group/:groupId',
            templateUrl: 'ddb/views/group.html'
        });
        $stateProvider.state('tools', {
            url: '/ddb/tools',
            templateUrl: 'ddb/views/tools.html'
        });
    }
]);

angular.module('mean.ddb')
    .config(['$viewPathProvider', function ($viewPathProvider) {
        $viewPathProvider.override('system/views/index.html', 'ddb/views/home.html');
        $viewPathProvider.override('users/views/login.html', 'ddb/views/login.html');
        $viewPathProvider.override('users/views/register.html', 'ddb/views/register.html');
        $viewPathProvider.override('users/views/index.html', 'ddb/views/authenticationparent.html');
    }]);
