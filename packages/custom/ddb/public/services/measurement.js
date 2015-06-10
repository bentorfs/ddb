'use strict';

angular.module('mean.ddb').factory('Measurement', ['$resource',
    function ($resource) {
        return $resource('api/measurement');
    }
]);
