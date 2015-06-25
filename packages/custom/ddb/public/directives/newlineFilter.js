'use strict';

angular.module('mean.ddb').filter('newlineFilter', function () {
    return function (text) {
        if (text !== undefined) return text.replace(/\n/g, '<br />');
    };
});