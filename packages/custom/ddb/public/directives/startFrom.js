'use strict';

angular.module('mean.ddb').filter('startFrom', function () {
    return function (input, start) {
        if (input) {
            start = +start; //parse to int
            return input.slice(start);
        } else {
            return [];
        }
    }
});