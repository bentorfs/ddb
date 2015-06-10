'use strict';

angular.module('mean.ddb').factory('DailyAnalysis', ['$resource',
    function ($resource) {
        return $resource('api/dailyanalysis');
    }

]);
