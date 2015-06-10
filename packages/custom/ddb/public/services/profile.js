'use strict';

angular.module('mean.ddb').factory('Profile', ['$resource',
    function ($resource) {
        return $resource('api/profile');
    }
]);
