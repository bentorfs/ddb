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
        $viewPathProvider.override('system/views/index.html', 'ddb/views/index.html');
    }]);
